import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepo();
  }, [id]);

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
      <div className="text-white text-xl">Analyzing...</div>
    </div>
  );

  if (!repo) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
      <div className="text-white text-xl">Repository not found</div>
    </div>
  );

  const totalBytes = Object.values(repo.languages || {}).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-black text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span style={{ color: 'rgba(255,255,255,0.5)' }}>Lens</span>
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#888888' }}
        >
          ← Back
        </button>
      </nav>

      <div className="px-8 pt-32 pb-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-5xl font-black text-white mb-3 glow-text">
                {repo.owner}/{repo.name}
              </h2>
              <p style={{ color: '#888888', fontSize: '18px' }} className="mb-4">
                {repo.description || 'No description available'}
              </p>
              <div className="flex gap-6" style={{ color: '#666666' }}>
                <span>⭐ {repo.stars} stars</span>
                <span>🍴 {repo.forks} forks</span>
                <span>👥 {repo.contributors} contributors</span>
                <span>📁 {repo.fileCount} files</span>
                <span>💾 {(repo.size / 1024).toFixed(1)} MB</span>
              </div>
            </div>
            <div className="text-center ml-8">
              <div className="text-6xl font-black text-white glow-text">{repo.qualityScore}%</div>
              <div style={{ color: '#888888' }}>Quality Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Stars', value: repo.stars },
            { label: 'Forks', value: repo.forks },
            { label: 'Files', value: repo.fileCount },
            { label: 'Contributors', value: repo.contributors },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl text-center"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div style={{ color: '#888888' }} className="text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Languages */}
        {Object.keys(repo.languages || {}).length > 0 && (
          <div className="p-6 rounded-2xl mb-6"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-black text-xl mb-6">Languages</h3>
            <div className="flex rounded-full overflow-hidden mb-4" style={{ height: '8px' }}>
              {Object.entries(repo.languages).map(([lang, bytes], i) => {
                const colors = ['#ffffff', '#888888', '#555555', '#333333', '#aaaaaa'];
                return (
                  <div key={lang}
                    style={{ width: `${(bytes / totalBytes) * 100}%`, background: colors[i % colors.length] }}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(repo.languages).map(([lang, bytes], i) => {
                const colors = ['#ffffff', '#888888', '#555555', '#333333', '#aaaaaa'];
                return (
                  <div key={lang} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }} />
                    <span className="text-white text-sm">{lang}</span>
                    <span style={{ color: '#888888' }} className="text-sm">
                      {((bytes / totalBytes) * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Topics */}
        {repo.topics?.length > 0 && (
          <div className="p-6 rounded-2xl mb-6"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-black text-xl mb-4">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {repo.topics.map((topic, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Security Issues */}
        <div className="p-6 rounded-2xl mb-8"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black text-xl mb-4">Security Analysis</h3>
          {repo.securityIssues?.length === 0 ? (
            <p style={{ color: '#888888' }}>✅ No security issues detected</p>
          ) : (
            <div className="space-y-2">
              {repo.securityIssues.map((issue, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)' }}>
                  <span>⚠️</span>
                  <span style={{ color: '#ff8888' }}>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Button */}
        <button
          onClick={() => navigate(`/chat/${repo._id}`)}
          className="w-full py-5 rounded-2xl font-black text-black text-xl glow-button"
          style={{ background: '#ffffff' }}
        >
          💬 Chat with this Codebase →
        </button>
      </div>
    </div>
  );
};

export default RepoDetail;