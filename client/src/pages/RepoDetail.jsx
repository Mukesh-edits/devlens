import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft, Shield, AlertTriangle, CheckCircle, Users, FileCode, Star, GitFork, Clock, Activity, Code, BookOpen, Zap, TrendingUp } from 'lucide-react';
import axios from '../utils/axios';

const qualityPill = (score) => {
  if (score >= 75) return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Excellent' };
  if (score >= 50) return { bg: '#fef9c3', color: '#ca8a04', border: '#fde68a', label: 'Moderate' };
  return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Needs Work' };
};

const LANG_COLORS = ['#6366f1','#a855f7','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#3b82f6'];

const HealthBar = ({ label, value, max = 100, color }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-slate-600 text-xs">{label}</span>
      <span className="text-slate-900 text-xs font-semibold">{value}/{max}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  </div>
);

const Badge = ({ children, color, bg, border }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
    style={{ background: bg, color, border: `1px solid ${border}` }}>
    {children}
  </span>
);

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRepo(); }, [id]);

  const fetchRepo = async () => {
    try {
      const res = await axios.get(`/repo/${id}`);
      setRepo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="text-slate-400 animate-pulse">Loading repository...</div>
    </div>
  );

  if (!repo) return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="text-slate-400">Repository not found</div>
    </div>
  );

  const totalBytes = Object.values(repo.languages || {}).reduce((a, b) => a + b, 0);
  const q = qualityPill(repo.qualityScore);

  // Derive insight data from what we have
  const hasTests = repo.securityIssues ? !repo.securityIssues.some(i => i.includes('No test')) : true;
  const hasCICD  = repo.securityIssues ? !repo.securityIssues.some(i => i.includes('CI/CD')) : true;
  const hasLicense = repo.securityIssues ? !repo.securityIssues.some(i => i.includes('license')) : true;
  const hasEnvLeak = repo.securityIssues ? repo.securityIssues.some(i => i.includes('.env')) : false;
  const langCount = Object.keys(repo.languages || {}).length;
  const topLang = Object.entries(repo.languages || {}).sort((a,b) => b[1]-a[1])[0]?.[0] || repo.language;

  // Score breakdown (approximate reverse-engineer for display)
  const docScore    = (repo.description ? 5 : 0) + 12; // assume readme since score > 12
  const testScore   = hasTests ? 15 : 0;
  const devopsScore = hasCICD ? 10 : 0;
  const licenseScore = hasLicense ? 5 : 0;
  const communityScore = repo.contributors > 1 ? 8 : 3;

  return (
    <div className="bg-pattern min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4"
        style={{ background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0' }}>
        <h1 className="text-xl font-black text-slate-900 cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span className="gradient-text">Lens</span>
        </h1>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500 bg-white"
          style={{ border: '1px solid #e2e8f0' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </nav>

      <div className="px-6 pt-24 pb-16 max-w-5xl mx-auto">

        {/* ── HERO HEADER ── */}
        <div className="p-6 rounded-2xl card-light mb-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#eef2ff', color: '#6366f1' }}>
                  <GitBranch size={20} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{repo.owner}/{repo.name}</h2>
                <a href={repo.githubUrl} target="_blank" rel="noreferrer"
                  className="px-3 py-1 rounded-lg text-xs text-slate-500 bg-white"
                  style={{ border: '1px solid #e2e8f0' }}>
                  GitHub ↗
                </a>
              </div>

              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                {repo.description || 'No description available'}
              </p>

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {topLang && (
                  <Badge color="#6366f1" bg="#eef2ff" border="#c7d2fe">{topLang}</Badge>
                )}
                {hasLicense && <Badge color="#16a34a" bg="#dcfce7" border="#bbf7d0">✓ Licensed</Badge>}
                {hasTests   && <Badge color="#0891b2" bg="#ecfeff" border="#a5f3fc">✓ Tests</Badge>}
                {hasCICD    && <Badge color="#7c3aed" bg="#f5f3ff" border="#ddd6fe">✓ CI/CD</Badge>}
                {hasEnvLeak && <Badge color="#dc2626" bg="#fee2e2" border="#fecaca">⚠ .env exposed</Badge>}
                {repo.topics?.slice(0,4).map((t,i) => (
                  <Badge key={i} color="#64748b" bg="#f8fafc" border="#e2e8f0">{t}</Badge>
                ))}
              </div>

              {/* Stat pills */}
              <div className="flex gap-5 text-slate-500 text-sm flex-wrap">
                <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400"/> {repo.stars?.toLocaleString()} stars</span>
                <span className="flex items-center gap-1.5"><GitFork size={14} className="text-indigo-400"/> {repo.forks?.toLocaleString()} forks</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-purple-400"/> {repo.contributors} contributors</span>
                <span className="flex items-center gap-1.5"><FileCode size={14} className="text-green-400"/> {repo.fileCount} files</span>
                <span className="flex items-center gap-1.5"><Code size={14} className="text-blue-400"/> {langCount} language{langCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Score circle */}
            <div className="flex-shrink-0 text-center">
              <div className="relative w-28 h-28 mx-auto mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={q.color} strokeWidth="10"
                    strokeDasharray={`${2.51 * repo.qualityScore} 251`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: q.color }}>{repo.qualityScore}%</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: q.bg, color: q.color, border: `1px solid ${q.border}` }}>
                {q.label}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN GRID ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">

          {/* Score Breakdown */}
          <div className="p-5 rounded-2xl card-light">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eef2ff', color: '#6366f1' }}>
                <TrendingUp size={15}/>
              </div>
              <h3 className="text-slate-900 font-semibold text-sm">Score Breakdown</h3>
            </div>
            <HealthBar label="Documentation"  value={docScore}      max={25} color="#6366f1"/>
            <HealthBar label="Testing"        value={testScore}     max={20} color="#22c55e"/>
            <HealthBar label="DevOps / CI-CD" value={devopsScore}   max={15} color="#a855f7"/>
            <HealthBar label="Community"      value={communityScore}max={15} color="#f59e0b"/>
            <HealthBar label="License"        value={licenseScore}  max={5}  color="#06b6d4"/>
          </div>

          {/* Languages */}
          <div className="p-5 rounded-2xl card-light">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Code size={15}/>
              </div>
              <h3 className="text-slate-900 font-semibold text-sm">Language Breakdown</h3>
            </div>

            {Object.keys(repo.languages || {}).length > 0 ? (
              <>
                <div className="flex rounded-full overflow-hidden mb-4" style={{ height: '10px' }}>
                  {Object.entries(repo.languages).map(([lang, bytes], i) => (
                    <div key={lang}
                      style={{ width: `${(bytes / totalBytes) * 100}%`, background: LANG_COLORS[i % LANG_COLORS.length] }}/>
                  ))}
                </div>
                <div className="space-y-2">
                  {Object.entries(repo.languages).map(([lang, bytes], i) => (
                    <div key={lang} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: LANG_COLORS[i % LANG_COLORS.length] }}/>
                        <span className="text-slate-700 text-xs font-medium">{lang}</span>
                      </div>
                      <span className="text-slate-400 text-xs">{((bytes / totalBytes) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No language data available</p>
            )}
          </div>
        </div>

        {/* ── HEALTH CHECKLIST ── */}
        <div className="p-5 rounded-2xl card-light mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Activity size={15}/>
            </div>
            <h3 className="text-slate-900 font-semibold text-sm">Repository Health Checklist</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'README / Documentation', pass: true },
              { label: 'License File',            pass: hasLicense },
              { label: 'Test Suite',              pass: hasTests },
              { label: 'CI/CD Pipeline',          pass: hasCICD },
              { label: 'Description Set',         pass: !!repo.description },
              { label: 'Topics / Tags',           pass: repo.topics?.length > 0 },
              { label: 'Multiple Contributors',   pass: repo.contributors > 1 },
              { label: 'No Secrets Exposed',      pass: !hasEnvLeak },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: item.pass ? '#f0fdf4' : '#fff7ed', border: `1px solid ${item.pass ? '#bbf7d0' : '#fed7aa'}` }}>
                {item.pass
                  ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0"/>
                  : <AlertTriangle size={15} className="text-amber-500 flex-shrink-0"/>}
                <span className="text-xs font-medium" style={{ color: item.pass ? '#15803d' : '#92400e' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ROW: Security + Topics ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">

          {/* Security */}
          <div className="p-5 rounded-2xl card-light">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fdf4ff', color: '#a855f7' }}>
                <Shield size={15}/>
              </div>
              <h3 className="text-slate-900 font-semibold text-sm">Security Issues</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold"
                style={repo.securityIssues?.length === 0
                  ? { background: '#dcfce7', color: '#16a34a' }
                  : { background: '#fee2e2', color: '#dc2626' }}>
                {repo.securityIssues?.length || 0} found
              </span>
            </div>
            {repo.securityIssues?.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 py-2">
                <CheckCircle size={16}/>
                <span className="text-sm font-medium">No issues detected</span>
              </div>
            ) : (
              <div className="space-y-2">
                {repo.securityIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                    <span className="text-amber-800 text-xs leading-relaxed">{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats + Topics */}
          <div className="p-5 rounded-2xl card-light">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Zap size={15}/>
              </div>
              <h3 className="text-slate-900 font-semibold text-sm">Quick Facts</h3>
            </div>
            <div className="space-y-2.5 mb-4">
              {[
                { label: 'Primary Language', value: topLang || '—' },
                { label: 'Repository Size',  value: repo.size ? `${(repo.size / 1024).toFixed(1)} MB` : '—' },
                { label: 'Total Files',      value: repo.fileCount },
                { label: 'Contributors',     value: repo.contributors },
                { label: 'Stars / Forks',    value: `${repo.stars} / ${repo.forks}` },
              ].map((fact, i) => (
                <div key={i} className="flex justify-between items-center py-1.5"
                  style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <span className="text-slate-500 text-xs">{fact.label}</span>
                  <span className="text-slate-900 text-xs font-semibold">{fact.value}</span>
                </div>
              ))}
            </div>
            {repo.topics?.length > 0 && (
              <>
                <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((topic, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── AI SUMMARY ── */}
        <div className="p-5 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #c7d2fe' }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-indigo-500"/>
            <h3 className="text-slate-900 font-semibold text-sm">Analysis Summary</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong>{repo.owner}/{repo.name}</strong> is a{' '}
            {topLang ? <><strong>{topLang}</strong>-based</> : ''} repository with{' '}
            <strong>{repo.fileCount} files</strong> and <strong>{repo.contributors} contributor{repo.contributors !== 1 ? 's' : ''}</strong>.{' '}
            {repo.qualityScore >= 75
              ? 'It follows strong engineering practices with good documentation, testing, and CI/CD setup.'
              : repo.qualityScore >= 50
              ? 'It has a reasonable foundation but could improve in areas like testing, CI/CD, or documentation.'
              : 'It is an early-stage or minimal project that would benefit from adding tests, CI/CD, a license, and better documentation.'
            }{' '}
            {hasEnvLeak ? '⚠️ A .env file was detected — consider removing it from version control immediately.' : ''}
            {' '}The overall quality score of <strong>{repo.qualityScore}%</strong> reflects{' '}
            {q.label.toLowerCase()} code health.
          </p>
        </div>

        {/* Chat Button */}
        <button onClick={() => navigate(`/chat/${repo._id}`)}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base gradient-btn">
          💬 Chat with this Codebase →
        </button>
      </div>
    </div>
  );
};

export default RepoDetail;