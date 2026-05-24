import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-black text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span style={{ color: 'rgba(255,255,255,0.4)' }}>Lens</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-black text-sm"
              style={{ background: '#ffffff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: '#888888' }}>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#888888' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-8 pt-32 pb-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p style={{ color: '#888888' }} className="mb-1">Good to see you back</p>
          <h2 className="text-5xl font-black text-white glow-text">
            {user?.name}
          </h2>
        </div>

        {/* Analyze Input */}
        <form onSubmit={handleAnalyze} className="mb-10">
          <p style={{ color: '#888888' }} className="text-sm mb-3">Analyze a GitHub repository</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-5 py-4 rounded-xl text-white placeholder-gray-600 focus:outline-none text-lg"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              type="submit"
              disabled={analyzing}
              className="px-8 py-4 rounded-xl font-bold text-black text-lg glow-button disabled:opacity-50"
              style={{ background: '#ffffff', whiteSpace: 'nowrap' }}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : '🔍 Analyze'}
            </button>
          </div>
          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
        </form>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Repos Analyzed', value: repos.length, icon: '📦' },
            { label: 'Avg Quality Score', value: repos.length ? Math.round(repos.reduce((a, r) => a + r.qualityScore, 0) / repos.length) + '%' : '—', icon: '📊' },
            { label: 'Total Files Scanned', value: repos.reduce((a, r) => a + (r.fileCount || 0), 0), icon: '📁' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
              <div style={{ color: '#666666' }} className="text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Repos List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-white">Analyzed Repositories</h3>
            <span style={{ color: '#666666' }} className="text-sm">{repos.length} total</span>
          </div>

          {loading ? (
            <div className="text-center py-12" style={{ color: '#888888' }}>
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : repos.length === 0 ? (
            <div className="text-center py-20 rounded-2xl"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white font-bold text-xl mb-2">No repositories yet</p>
              <p style={{ color: '#888888' }}>Paste a GitHub URL above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/${repo._id}`)}
                  className="p-6 rounded-2xl cursor-pointer transition-all"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-bold text-lg">
                          {repo.owner}/<span className="text-white">{repo.name}</span>
                        </h4>
                        {repo.isIndexed && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#888888' }}>
                            💬 Chat ready
                          </span>
                        )}
                        {repo.language && (
                          <span className="px-2 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#666666' }}>
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#666666' }} className="text-sm mb-3">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex gap-5 text-sm" style={{ color: '#555555' }}>
                        <span>⭐ {repo.stars?.toLocaleString()}</span>
                        <span>🍴 {repo.forks?.toLocaleString()}</span>
                        <span>📁 {repo.fileCount} files</span>
                        <span>👥 {repo.contributors} contributors</span>
                      </div>
                    </div>
                    <div className="text-right ml-6 flex-shrink-0">
                      <div className="text-4xl font-black text-white">{repo.qualityScore}%</div>
                      <div style={{ color: '#555555' }} className="text-xs mt-1">quality</div>
                    </div>
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