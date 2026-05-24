import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from '../utils/axios';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [indexError, setIndexError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchRepo(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchRepo = async () => {
    try {
      const res = await axios.get(`/repo/${id}`);
      setRepo(res.data);
      setIndexed(res.data.isIndexed);
    } catch (err) { console.error(err); }
  };

  const handleIndex = async () => {
    setIndexing(true);
    setIndexError('');
    try {
      await axios.post(`/repo/${id}/index`);
      setIndexed(true);
      setMessages([]);  // empty = shows the beautiful ready state
    } catch (err) {
      setIndexError(err.response?.data?.message || 'Indexing failed');
    } finally { setIndexing(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`/repo/${id}/chat`, { question: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const SUGGESTIONS = [
    "How does authentication work?",
    "What are the main components?",
    "Explain the folder structure",
    "What APIs does this expose?"
  ];

  return (
    <div style={{ background: '#e8edf5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4"
        style={{ background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0' }}>
        <h1 className="text-xl font-black text-slate-900 cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span className="gradient-text">Lens</span>
        </h1>
        <div className="flex items-center gap-4">
          {repo && (
            <span className="text-slate-500 text-sm flex items-center gap-1.5">
              <Zap size={12} className="text-indigo-500" />
              {repo.owner}/{repo.name}
            </span>
          )}
          <button onClick={() => navigate(`/repo/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 bg-white transition-all duration-200"
            style={{ border: '1px solid #e2e8f0' }}>
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      </nav>

      {/* Index Banner */}
      {!indexed && (
        <div className="fixed z-40 left-0 right-0 px-8 py-4"
          style={{ top: '61px', background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-slate-900 font-semibold text-sm">
                {indexing ? '⏳ Indexing in progress...' : 'Index this repository first'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {indexing
                  ? 'Analyzing files & generating embeddings — this takes about 1–2 minutes. Please wait!'
                  : 'Analyze all code files to enable AI chat'}
              </p>
              {indexing && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 w-48 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full animate-pulse"
                      style={{ width: '60%', background: 'linear-gradient(135deg, #6366f1, #9333ea)' }} />
                  </div>
                  <span className="text-indigo-500 text-xs font-medium">Processing...</span>
                </div>
              )}
            </div>
            {!indexing && (
              <button onClick={handleIndex}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm gradient-btn">
                🚀 Index Repository
              </button>
            )}
          </div>
          {indexError && <p className="text-red-500 text-xs mt-2 max-w-4xl mx-auto">{indexError}</p>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pb-32"
        style={{ paddingTop: indexed ? '88px' : '148px' }}>
        <div className="max-w-3xl mx-auto">

          {/* Empty state after indexed */}
          {messages.length === 0 && indexed && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' }}>
                <Zap size={28} color="#fff" />
              </div>
              <h3 className="text-slate-900 font-black text-2xl mb-2">
                Codebase is ready to chat
              </h3>
              <p className="text-slate-500 text-sm mb-1">
                Powered by <span className="font-semibold text-indigo-600">NVIDIA Nemotron</span> + RAG Architecture
              </p>
              <div className="flex items-center gap-2 mb-10">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-600 text-xs font-medium">Indexed and ready</span>
              </div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Try asking</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    className="p-4 rounded-xl text-left text-sm text-slate-700 bg-white transition-all duration-200 card-light group">
                    <span className="text-indigo-500 mr-2 group-hover:mr-3 transition-all">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1"
                  style={{ background: '#eef2ff', color: '#6366f1' }}>
                  <Zap size={14} />
                </div>
              )}
              <div className="max-w-2xl">
                {msg.role === 'user' ? (
                  <div className="px-4 py-3 rounded-2xl text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)' }}>
                    {msg.content}
                  </div>
                ) : (
                  <div className="px-5 py-4 rounded-2xl text-sm bg-white"
                    style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-bold text-slate-900 mb-2 mt-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold text-slate-900 mb-2 mt-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold text-slate-900 mb-1 mt-2">{children}</h3>,
                        p: ({children}) => <p className="mb-3 leading-relaxed text-slate-700">{children}</p>,
                        strong: ({children}) => <strong className="text-slate-900 font-semibold">{children}</strong>,
                        code: ({inline, children}) => inline
                          ? <code className="px-1.5 py-0.5 rounded text-xs font-mono text-indigo-700"
                              style={{ background: '#eef2ff' }}>{children}</code>
                          : <code>{children}</code>,
                        pre: ({children}) => (
                          <pre className="p-4 rounded-xl mb-3 overflow-x-auto text-xs font-mono text-slate-200"
                            style={{ background: '#1e293b' }}>{children}</pre>
                        ),
                        ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700">{children}</ol>,
                        li: ({children}) => <li className="text-sm">{children}</li>,
                        table: ({children}) => (
                          <div className="overflow-x-auto mb-3 rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
                            <table className="w-full text-xs">{children}</table>
                          </div>
                        ),
                        th: ({children}) => <th className="px-3 py-2 text-left text-slate-900 font-semibold bg-slate-50"
                          style={{ borderBottom: '1px solid #e2e8f0' }}>{children}</th>,
                        td: ({children}) => <td className="px-3 py-2 text-slate-600"
                          style={{ borderBottom: '1px solid #f1f5f9' }}>{children}</td>,
                      }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
                style={{ background: '#eef2ff', color: '#6366f1' }}>
                <Zap size={14} />
              </div>
              <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-white"
                style={{ border: '1px solid #e2e8f0' }}>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Frosted Glass */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-5"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.9)', borderTop: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 -8px 30px rgba(0,0,0,0.06)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 px-4 py-3 rounded-2xl bg-white"
            style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={indexed ? "Ask anything about the codebase..." : "Index the repository first"}
              disabled={!indexed || loading}
              rows={1}
              className="flex-1 text-slate-900 placeholder-slate-400 focus:outline-none resize-none bg-transparent text-sm disabled:opacity-50"
              style={{ lineHeight: '1.5' }}
            />
            <button onClick={handleSend}
              disabled={!indexed || loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30 gradient-btn">
              <Send size={14} color="#ffffff" />
            </button>
          </div>
          <p className="text-center text-xs mt-2 text-slate-400">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;