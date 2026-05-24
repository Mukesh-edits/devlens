const Repository = require('../models/Repository');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const analyzeRepo = async (req, res) => {
  try {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ message: 'GitHub URL is required' });
    }

    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repoName = urlParts[1];

    if (!owner || !repoName) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }

    const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });
    const { data: languagesData } = await octokit.repos.listLanguages({ owner, repo: repoName });

    let contributorsCount = 0;
    try {
      const { data: contributors } = await octokit.repos.listContributors({
        owner,
        repo: repoName,
        per_page: 100
      });
      contributorsCount = contributors.length;
    } catch (e) {
      contributorsCount = 0;
    }

    let fileCount = 0;
    try {
      const { data: tree } = await octokit.git.getTree({
        owner,
        repo: repoName,
        tree_sha: repoData.default_branch,
        recursive: 'true'
      });
      fileCount = tree.tree.filter(f => f.type === 'blob').length;
    } catch (e) {
      fileCount = 0;
    }

    let qualityScore = 50;
    if (repoData.description) qualityScore += 10;
    if (repoData.license) qualityScore += 10;
    if (repoData.topics?.length > 0) qualityScore += 10;
    if (contributorsCount > 1) qualityScore += 10;
    if (fileCount > 10) qualityScore += 10;

    const securityIssues = [];
    if (!repoData.private && !repoData.license) {
      securityIssues.push('No license file found');
    }
    if (repoData.has_issues === false) {
      securityIssues.push('Issues are disabled');
    }

    const repo = await Repository.findOneAndUpdate(
      { user: req.user._id, githubUrl },
      {
        user: req.user._id,
        githubUrl,
        owner,
        name: repoData.name,
        description: repoData.description || '',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || 'Unknown',
        languages: languagesData,
        fileCount,
        size: repoData.size,
        topics: repoData.topics || [],
        contributors: contributorsCount,
        qualityScore,
        securityIssues,
        isAnalyzed: true,
        analyzedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Repository analyzed successfully',
      repo
    });

  } catch (error) {
    console.error('Repo analysis error:', error);
    if (error.status === 404) {
      return res.status(404).json({ message: 'Repository not found or is private' });
    }
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
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const indexRepo = async (req, res) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/index`, {
      repo_id: repo._id.toString(),
      owner: repo.owner,
      repo: repo.name
    });

    await Repository.findByIdAndUpdate(repo._id, { isIndexed: true });

    res.json({
      message: 'Repository indexed successfully',
      details: mlResponse.data
    });

  } catch (error) {
    console.error('Index error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const chatWithRepo = async (req, res) => {
  try {
    const { question } = req.body;
    const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    if (!repo.isIndexed) {
      return res.status(400).json({ message: 'Repository not indexed yet' });
    }

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