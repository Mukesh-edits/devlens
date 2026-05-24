import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-black text-white">
          Dev<span style={{ color: '#ffffff' }}>Lens</span>
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-lg text-white font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff' }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 rounded-lg font-bold text-black glow-button"
            style={{ background: '#ffffff' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', paddingTop: '80px' }}>
        
        <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-8"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff' }}>
          ✦ AI-Powered GitHub Analysis
        </div>

        <h1 className="text-6xl font-black text-white mb-6 leading-tight glow-text" style={{ maxWidth: '800px' }}>
          Understand Any
          <br />
          <span style={{ color: '#ffffff' }}>Codebase Instantly</span>
        </h1>

        <p className="text-xl mb-12" style={{ color: '#888888', maxWidth: '600px', lineHeight: '1.8' }}>
          Paste a GitHub URL. Get instant code quality analysis, security insights, 
          and chat with the codebase using AI.
        </p>

        <button
          onClick={() => navigate('/signup')}
          className="px-10 py-4 rounded-xl font-bold text-black text-lg glow-button mb-16"
          style={{ background: '#ffffff' }}
        >
          Analyze a Repository →
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-16 mb-24">
          {[
            { number: 'RAG', label: 'AI Architecture' },
            { number: 'AI', label: 'Code Analysis' },
            { number: '∞', label: 'Repositories' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black mb-2" style={{ color: '#ffffff' }}>
                {stat.number}
              </div>
              <div style={{ color: '#888888' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 w-full" style={{ maxWidth: '900px' }}>
          {[
            { icon: '🔍', title: 'Deep Analysis', desc: 'Language breakdown, file count, contributors, and code quality scoring.' },
            { icon: '🔒', title: 'Security Scan', desc: 'Detect vulnerabilities, exposed secrets, and security anti-patterns.' },
            { icon: '💬', title: 'Chat with Code', desc: 'Ask anything about the codebase. Get instant AI-powered answers.' },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl text-left glow-border"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p style={{ color: '#888888', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: '#444444' }}>
        DevLens © 2025 — Built with AI
      </div>
    </div>
  );
};

export default Landing;