const Repository = require('../models/Repository');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const analyzeRepo = async (req, res) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) return res.status(400).json({ message: 'GitHub URL is required' });

    const clean = githubUrl.replace('https://github.com/', '').replace('.git', '');
    const [owner, repoName] = clean.split('/');
    if (!owner || !repoName) return res.status(400).json({ message: 'Invalid GitHub URL' });

    const [{ data: repoData }, { data: languagesData }] = await Promise.all([
      octokit.repos.get({ owner, repo: repoName }),
      octokit.repos.listLanguages({ owner, repo: repoName }),
    ]);

    let contributorsCount = 0;
    try {
      const { data: contributors } = await octokit.repos.listContributors({ owner, repo: repoName, per_page: 100 });
      contributorsCount = contributors.length;
    } catch (e) {}

    let fileCount = 0;
    let fileTree = [];
    try {
      const { data: tree } = await octokit.git.getTree({ owner, repo: repoName, tree_sha: repoData.default_branch, recursive: 'true' });
      fileTree = tree.tree.filter(f => f.type === 'blob');
      fileCount = fileTree.length;
    } catch (e) {}

    const filePaths = fileTree.map(f => f.path.toLowerCase());

    const hasReadme       = filePaths.some(p => p.startsWith('readme'));
    const hasLicense      = filePaths.some(p => p.startsWith('license') || p.startsWith('licence'));
    const hasContributing = filePaths.some(p => p.includes('contributing'));
    const hasChangelog    = filePaths.some(p => p.includes('changelog') || p.includes('history'));
    const hasDockerfile   = filePaths.some(p => p.includes('dockerfile'));
    const hasEnvExample   = filePaths.some(p => p.includes('.env.example') || p.includes('.env.sample'));
    const hasEnvReal      = filePaths.some(p => p === '.env');
    const hasGithubActions = filePaths.some(p => p.includes('.github/workflows'));
    const hasJenkinsfile  = filePaths.some(p => p.includes('jenkinsfile'));
    const hasTravisCI     = filePaths.some(p => p.includes('.travis.yml'));
    const hasCircleCI     = filePaths.some(p => p.includes('.circleci'));
    const hasCICD         = hasGithubActions || hasJenkinsfile || hasTravisCI || hasCircleCI;
    const hasPackageJson  = filePaths.some(p => p === 'package.json');
    const hasRequirements = filePaths.some(p => p.includes('requirements.txt') || p.includes('pipfile') || p.includes('pyproject.toml'));
    const hasPomXml       = filePaths.some(p => p.includes('pom.xml') || p.includes('build.gradle'));
    const hasGoMod        = filePaths.some(p => p === 'go.mod');
    const hasDependencyFile = hasPackageJson || hasRequirements || hasPomXml || hasGoMod;
    const hasLinter       = filePaths.some(p => p.includes('.eslintrc') || p.includes('.eslint') || p.includes('.pylintrc') || p.includes('.flake8'));
    const hasFormatter    = filePaths.some(p => p.includes('.prettierrc') || p.includes('.editorconfig'));
    const hasTypeScript   = filePaths.some(p => p.endsWith('.ts') || p.endsWith('.tsx'));
    const hasSecurity     = filePaths.some(p => p.includes('security') || p.includes('codeql') || p.includes('snyk') || p.includes('dependabot'));

    const testFiles = filePaths.filter(p =>
      p.includes('/test') || p.includes('/tests') || p.includes('/spec') ||
      p.includes('/__tests__') || p.endsWith('.test.js') || p.endsWith('.spec.js') ||
      p.endsWith('.test.ts') || p.endsWith('.spec.ts') || p.endsWith('test.py') ||
      p.includes('_test.go') || p.endsWith('test.java')
    );
    const hasTests = testFiles.length > 0;
    const testCoverage = Math.min(100, Math.round((testFiles.length / Math.max(fileCount, 1)) * 400));

    const daysSincePush = Math.floor((Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
    const activityScore = daysSincePush < 7 ? 15 : daysSincePush < 30 ? 12 : daysSincePush < 90 ? 8 : daysSincePush < 365 ? 4 : 0;

    let qualityScore = 0;
    if (hasReadme)        qualityScore += 12;
    if (repoData.description) qualityScore += 5;
    if (hasContributing)  qualityScore += 4;
    if (hasChangelog)     qualityScore += 4;
    if (hasLinter)        qualityScore += 7;
    if (hasFormatter)     qualityScore += 5;
    if (hasTypeScript)    qualityScore += 4;
    if (hasDependencyFile) qualityScore += 4;
    if (hasTests)         qualityScore += 12;
    qualityScore += Math.round(testCoverage * 0.08);
    if (hasCICD)          qualityScore += 10;
    if (hasDockerfile)    qualityScore += 5;
    qualityScore += Math.min(activityScore, 15);
    if (contributorsCount > 1) qualityScore += 3;
    if (contributorsCount > 5) qualityScore += 2;
    if (repoData.topics?.length > 0) qualityScore += 2;
    if (repoData.topics?.length > 3) qualityScore += 1;
    if (repoData.license || hasLicense) qualityScore += 5;
    qualityScore = Math.min(100, qualityScore);

    const securityIssues = [];
    if (!repoData.license && !hasLicense) securityIssues.push('No license file found');
    if (hasEnvReal) securityIssues.push('.env file committed — may expose secrets');
    if (!hasEnvExample && hasPackageJson) securityIssues.push('No .env.example — environment variables undocumented');
    if (!hasCICD) securityIssues.push('No CI/CD pipeline detected');
    if (!hasTests) securityIssues.push('No test files found — code reliability unknown');
    if (!hasSecurity && repoData.stargazers_count > 50) securityIssues.push('No security policy or vulnerability scanning detected');
    if (daysSincePush > 365) securityIssues.push('Repository inactive for over 1 year');

    const repo = await Repository.findOneAndUpdate(
      { user: req.user._id, githubUrl },
      {
        user: req.user._id, githubUrl, owner,
        name: repoData.name,
        description: repoData.description || '',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || 'Unknown',
        languages: languagesData,
        fileCount, size: repoData.size,
        topics: repoData.topics || [],
        contributors: contributorsCount,
        qualityScore, securityIssues,
        isAnalyzed: true, analyzedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Repository analyzed successfully', repo });

  } catch (error) {
    console.error('Repo analysis error:', error);
    if (error.status === 404) return res.status(404).json({ message: 'Repository not found or is private' });
    res.status(500).json({ message: error.message });
  }
};

const getUserRepos = async (req, res) => {
  try {
    const repos = await Repository.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRepo = async (req, res) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const indexRepo = async (req, res) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/index`, {
      repo_id: repo._id.toString(),
      owner: repo.owner,
      repo: repo.name
    });

    await Repository.findByIdAndUpdate(repo._id, { isIndexed: true });
    res.json({ message: 'Repository indexed successfully', details: mlResponse.data });

  } catch (error) {
    console.error('Index error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const chatWithRepo = async (req, res) => {
  try {
    const { question } = req.body;
    const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.isIndexed) return res.status(400).json({ message: 'Repository not indexed yet' });

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/chat`, {
      repo_id: repo._id.toString(),
      question
    });

    res.json({ answer: mlResponse.data.answer });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeRepo, getUserRepos, getRepo, indexRepo, chatWithRepo };