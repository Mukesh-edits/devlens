import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  useEffect(() => {
    fetchRepo();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRepo = async () => {
    try {
      const res = await axios.get(`/repo/${id}`);
      setRepo(res.data);
      setIndexed(res.data.isIndexed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIndex = async () => {
    setIndexing(true);
    setIndexError('');
    try {
      await axios.post(`/repo/${id}/index`);
      setIndexed(true);
      setMessages([{
        role: 'assistant',
        content: `✅ Repository indexed! I've analyzed all the code files. Ask me anything about **${repo?.owner}/${repo?.name}**!`
      }]);
    } catch (err) {
      setIndexError(err.response?.data?.message || 'Indexing failed');
    } finally {
      setIndexing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`/repo/${id}/chat`, { question: input });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ background: '#000000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-black text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dev<span style={{ color: 'rgba(255,255,255,0.5)' }}>Lens</span>
        </h1>
        <div className="flex items-center gap-4">
          {repo && (
            <span style={{ color: '#888888' }} className="text-sm">
              {repo.owner}/{repo.name}
            </span>
          )}
          <button
            onClick={() => navigate(`/repo/${id}`)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#888888' }}
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Index Banner */}
      {!indexed && (
        <div className="fixed top-20 left-0 right-0 z-40 px-8 py-4"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Index this repository first</p>
              <p style={{ color: '#888888' }} className="text-sm">
                This will analyze all code files and enable AI chat
              </p>
            </div>
            <button
              onClick={handleIndex}
              disabled={indexing}
              className="px-6 py-3 rounded-xl font-bold text-black glow-button disabled:opacity-50"
              style={{ background: '#ffffff' }}
            >
              {indexing ? '⏳ Indexing...' : '🚀 Index Repository'}
            </button>
          </div>
          {indexError && (
            <p className="text-red-400 text-sm mt-2 max-w-4xl mx-auto">{indexError}</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pb-32"
        style={{ paddingTop: indexed ? '100px' : '180px' }}>
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && indexed && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-white font-black text-2xl mb-2">
                Ask anything about the codebase
              </h3>
              <p style={{ color: '#888888' }}>
                Try: "How does authentication work?" or "What are the main components?"
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 text-left">
                {[
                  "How does authentication work?",
                  "What are the main components?",
                  "Explain the folder structure",
                  "What APIs does this expose?"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', color: '#888888' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="px-6 py-4 rounded-2xl max-w-3xl"
                style={{
                  background: msg.role === 'user' ? '#ffffff' : '#0a0a0a',
                  color: msg.role === 'user' ? '#000000' : '#ffffff',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}
              >
                {msg.role === 'assistant' ? (
  <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
      h1: ({children}) => <h1 className="text-xl font-black text-white mb-3">{children}</h1>,
      h2: ({children}) => <h2 className="text-lg font-bold text-white mb-2">{children}</h2>,
      h3: ({children}) => <h3 className="text-base font-bold text-white mb-2">{children}</h3>,
      p: ({children}) => <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>,
      strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
      code: ({children}) => <code className="px-2 py-1 rounded text-sm font-mono" style={{background: 'rgba(255,255,255,0.1)', color: '#ffffff'}}>{children}</code>,
      pre: ({children}) => <pre className="p-4 rounded-xl mb-3 overflow-x-auto text-sm font-mono" style={{background: 'rgba(0,0,0,0.5)'}}>{children}</pre>,
      ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-200">{children}</ul>,
      ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-200">{children}</ol>,
      li: ({children}) => <li className="text-gray-200">{children}</li>,
      table: ({children}) => <div className="overflow-x-auto mb-3"><table className="w-full text-sm border-collapse">{children}</table></div>,
      th: ({children}) => <th className="px-3 py-2 text-left text-white font-bold" style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>{children}</th>,
      td: ({children}) => <td className="px-3 py-2 text-gray-300" style={{borderBottom: '1px solid rgba(255,255,255,0.08)'}}>{children}</td>,
    }}
  >
    {msg.content}
  </ReactMarkdown>
) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-6 flex justify-start">
              <div className="px-6 py-4 rounded-2xl"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-6"
        style={{ background: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={indexed ? "Ask anything about the codebase..." : "Index the repository first to start chatting"}
            disabled={!indexed || loading}
            rows={1}
            className="flex-1 px-5 py-4 rounded-xl text-white placeholder-gray-600 focus:outline-none resize-none disabled:opacity-50"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={handleSend}
            disabled={!indexed || loading || !input.trim()}
            className="px-6 py-4 rounded-xl font-bold text-black glow-button disabled:opacity-50"
            style={{ background: '#ffffff' }}
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: '#444444' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;