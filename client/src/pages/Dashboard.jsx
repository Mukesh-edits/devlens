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
          Dev<span style={{ color: 'rgba(255,255,255,0.5)' }}>Lens</span>
        </h1>
        <div className="flex items-center gap-6">
          <span style={{ color: '#888888' }}>{user?.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#888888' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-8 pt-32 pb-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h2 className="text-5xl font-black text-white mb-3 glow-text">
            Welcome back, {user?.name}
          </h2>
          <p style={{ color: '#888888', fontSize: '18px' }}>
            Analyze any GitHub repository with AI
          </p>
        </div>

        {/* Analyze Input */}
        <form onSubmit={handleAnalyze} className="mb-12">
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
              {analyzing ? 'Analyzing...' : '🔍 Analyze'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </form>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Repos Analyzed', value: repos.length },
            { label: 'Avg Quality Score', value: repos.length ? Math.round(repos.reduce((a, r) => a + r.qualityScore, 0) / repos.length) + '%' : '0%' },
            { label: 'Security Issues', value: repos.reduce((a, r) => a + (r.securityIssues?.length || 0), 0) },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
              <div style={{ color: '#888888' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Repos List */}
        <div>
          <h3 className="text-2xl font-black text-white mb-6">Analyzed Repositories</h3>
          {loading ? (
            <div className="text-center py-12" style={{ color: '#888888' }}>Loading...</div>
          ) : repos.length === 0 ? (
            <div className="text-center py-16 rounded-2xl"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-bold text-xl mb-2">No repositories yet</p>
              <p style={{ color: '#888888' }}>Paste a GitHub URL above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {repos.map((repo) => (
                <div
                  key={repo._id}
                  onClick={() => navigate(`/repo/${repo._id}`)}
                  className="p-6 rounded-2xl cursor-pointer transition-all hover:border-white"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">
                        {repo.owner}/{repo.name}
                      </h4>
                      <p style={{ color: '#888888' }} className="text-sm mb-3">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex gap-4 text-sm" style={{ color: '#666666' }}>
                        <span>⭐ {repo.stars}</span>
                        <span>🍴 {repo.forks}</span>
                        <span>📁 {repo.fileCount} files</span>
                        <span>🌐 {repo.language}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{repo.qualityScore}%</div>
                      <div style={{ color: '#888888' }} className="text-sm">Quality</div>
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