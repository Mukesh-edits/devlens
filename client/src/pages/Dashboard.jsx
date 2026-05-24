import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { GitBranch, Search, Package, BarChart2, Folder, LogOut } from 'lucide-react';

const qualityPill = (score) => {
  if (score >= 90) return 'quality-green';
  if (score >= 60) return 'quality-yellow';
  return 'quality-red';
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRepos(); }, []);

  const fetchRepos = async () => {
    try {
      const res = await axios.get('/repo');
      setRepos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setError('');
    try {
      const res = await axios.post('/repo/analyze', { githubUrl: url });
      navigate(`/repo/${res.data.repo._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-pattern min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4"
        style={{ background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0' }}>
        <h1 className="text-xl font-black text-slate-900 cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span className="gradient-text">Lens</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs gradient-btn">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-600 text-sm">{user?.name}</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 transition-all duration-200"
            style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </nav>

      <div className="px-8 pt-28 pb-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-sm mb-1">Good to see you back 👋</p>
          <h2 className="text-4xl font-black text-slate-900">{user?.name}</h2>
        </div>

        {/* Analyze Input */}
        <form onSubmit={handleAnalyze} className="mb-8">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Analyze a repository</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 rounded-xl bg-white"
              style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="https://github.com/username/repository"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="flex-1 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none text-sm bg-transparent"
              />
            </div>
            <button type="submit" disabled={analyzing}
              className="px-6 py-3.5 rounded-xl font-semibold text-white text-sm gradient-btn disabled:opacity-50"
              style={{ whiteSpace: 'nowrap' }}>
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : 'Analyze'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-500 text-xs">{error}</p>}
        </form>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Repos Analyzed', value: repos.length, icon: <Package size={16} />, iconBg: '#eef2ff', iconColor: '#6366f1' },
            { label: 'Avg Quality Score', value: repos.length ? Math.round(repos.reduce((a, r) => a + r.qualityScore, 0) / repos.length) + '%' : '—', icon: <BarChart2 size={16} />, iconBg: '#f0fdf4', iconColor: '#16a34a' },
            { label: 'Total Files Scanned', value: repos.reduce((a, r) => a + (r.fileCount || 0), 0).toLocaleString(), icon: <Folder size={16} />, iconBg: '#fffbeb', iconColor: '#d97706' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-xl card-light">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: stat.iconBg, color: stat.iconColor }}>
                  {stat.icon}
                </div>
                <span className="text-slate-500 text-sm">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Repos List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-900">Analyzed Repositories</h3>
            <span className="text-slate-400 text-xs">{repos.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <div className="text-center py-16 rounded-2xl card-light">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-900 font-semibold mb-1">No repositories yet</p>
              <p className="text-slate-500 text-sm">Paste a GitHub URL above to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {repos.map((repo) => (
                <div key={repo._id} onClick={() => navigate(`/repo/${repo._id}`)}
                  className="flex items-center justify-between px-5 py-4 rounded-xl card-light cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: '#eef2ff', color: '#6366f1' }}>
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium text-sm">{repo.owner}/{repo.name}</span>
                        {repo.isIndexed && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                            💬 chat ready
                          </span>
                        )}
                        {repo.language && (
                          <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-slate-400 text-xs">
                        <span>⭐ {repo.stars?.toLocaleString()}</span>
                        <span>🍴 {repo.forks?.toLocaleString()}</span>
                        <span>📁 {repo.fileCount} files</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-black ${qualityPill(repo.qualityScore)}`}>
                      {repo.qualityScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;