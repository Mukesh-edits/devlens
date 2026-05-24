import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Analyze = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/repo/analyze', { githubUrl: url });
      navigate(`/repo/${res.data.repo._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a14' }}>
      <div className="w-full max-w-2xl p-8 rounded-2xl" style={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)' }}>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Dev<span className="text-indigo-400">Lens</span></h1>
          <p className="text-gray-400 text-lg">Paste a GitHub repository URL to analyze</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="https://github.com/username/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            style={{ background: '#0a0a14', border: '1px solid rgba(99,102,241,0.3)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analyzing Repository...
              </span>
            ) : '🔍 Analyze Repository'}
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <div className="text-2xl mb-1">📊</div>
            <p className="text-gray-400 text-sm">Code Quality Score</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-gray-400 text-sm">Security Analysis</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <div className="text-2xl mb-1">💬</div>
            <p className="text-gray-400 text-sm">Chat with Codebase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;