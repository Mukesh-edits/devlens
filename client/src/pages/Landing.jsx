import { useNavigate } from 'react-router-dom';
import { Search, Shield, MessageSquare, Zap, BarChart2, Lock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-pattern min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4"
        style={{ background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0' }}>
        <h1 className="text-xl font-black text-slate-900">
          Dev<span className="gradient-text">Lens</span>
        </h1>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 transition-all duration-300 hover:text-slate-900"
            style={{ border: '1px solid #e2e8f0' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#a5b4fc'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
            Login
          </button>
          <button onClick={() => navigate('/signup')}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white gradient-btn">
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', paddingTop: '80px' }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-10"
          style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#6366f1' }}>
          <Zap size={14} />
          AI-Powered GitHub Analysis · RAG Architecture
        </div>

        {/* Hero Text */}
        <h1 className="text-7xl font-black mb-6 leading-tight text-slate-900" style={{ maxWidth: '820px' }}>
          Understand Any<br />
          <span className="gradient-text">Codebase Instantly</span>
        </h1>

        <p className="text-lg mb-10 text-slate-500" style={{ maxWidth: '520px', lineHeight: '1.8' }}>
          Paste a GitHub URL. Get instant code quality analysis, security insights,
          and chat with the codebase using AI.
        </p>

        <div className="flex gap-3 mb-20">
          <button onClick={() => navigate('/signup')}
            className="px-8 py-3.5 rounded-xl font-semibold text-white gradient-btn text-sm">
            Analyze a Repository →
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-600 transition-all duration-300"
            style={{ border: '1px solid #e2e8f0', background: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#a5b4fc'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
            Sign in
          </button>
        </div>

        {/* Stats Row - Glassmorphic */}
        <div className="flex gap-0 mb-20 rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
          {[
            { number: 'RAG', label: 'AI Architecture' },
            { number: 'AI', label: 'Code Analysis' },
            { number: '∞', label: 'Repositories' },
          ].map((stat, i) => (
            <div key={i} className="text-center px-12 py-6"
              style={{ borderRight: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
              <div className="text-3xl font-black gradient-text mb-1">{stat.number}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-5 w-full" style={{ maxWidth: '900px' }}>
          {[
            {
              icon: <BarChart2 size={22} />,
              iconBg: '#eef2ff', iconColor: '#6366f1',
              title: 'Deep Analysis',
              desc: 'Language breakdown, file count, contributors, and code quality scoring.'
            },
            {
              icon: <Lock size={22} />,
              iconBg: '#fffbeb', iconColor: '#d97706',
              title: 'Security Scan',
              desc: 'Detect vulnerabilities, exposed secrets, and security anti-patterns.'
            },
            {
              icon: <MessageSquare size={22} />,
              iconBg: '#f0fdf4', iconColor: '#16a34a',
              title: 'Chat with Code',
              desc: 'Ask anything about the codebase. Get instant AI-powered answers.'
            },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl text-left card-3d cursor-default">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.iconBg, color: f.iconColor }}>
                {f.icon}
              </div>
              <h3 className="text-slate-900 font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm" style={{ lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-slate-400 text-sm"
        style={{ borderTop: '1px solid #e2e8f0' }}>
        DevLens © 2025 — Built with AI
      </div>
    </div>
  );
};

export default Landing;