import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, ChevronDown, BookOpen, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AiAssistant() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi there! 👋 I am **TuteAI**, your personal AI tutor. How can I help you with your studies today? You can ask me questions about Biology, Math, Physics, or any other subject!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Don't render the floating assistant if the user is not logged in
  if (!token) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setError(null);

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: userMessageText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Map frontend messages to match backend structure (excluding system prompt which backend adds)
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await api.post('/ai/chat', { messages: apiMessages });

      if (response.data?.success && response.data?.data) {
        setMessages(prev => [...prev, response.data.data]);
      } else {
        throw new Error(response.data?.message || 'Failed to get response from AI.');
      }
    } catch (err) {
      console.error('AI assistant chat error:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please check if server is configured properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your conversation?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Chat reset! 🧹 How can I help you with your studies now?',
        },
      ]);
      setError(null);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInputValue(promptText);
  };

  // Safe and beautiful markdown formatter helper
  const formatMarkdown = (text) => {
    if (!text) return '';

    // Split text by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // If it is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        // Extract language if specified on first line
        let lang = 'code';
        let code = lines.join('\n');
        if (lines[0] && lines[0].length < 15 && !lines[0].includes(' ') && lines[0] === lines[0].toLowerCase()) {
          lang = lines[0];
          code = lines.slice(1).join('\n');
        }

        return (
          <div key={index} className="my-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-lg overflow-hidden border border-slate-700 shadow-md">
            <div className="bg-slate-800 px-3 py-1.5 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <span>{lang}</span>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline formatting for non-code block text
      const lines = part.split('\n');
      return (
        <span key={index}>
          {lines.map((line, lineIndex) => {
            let processedLine = line;

            // Handle bullet items
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const isNumbered = /^\d+\.\s/.test(line.trim());

            if (isBullet) {
              processedLine = line.trim().substring(2);
            } else if (isNumbered) {
              const match = line.trim().match(/^(\d+\.\s)(.*)/);
              processedLine = match ? match[2] : line;
            }

            // Parse bold elements (**text**)
            const boldParts = processedLine.split(/(\*\*.*?\*\*)/g);
            const lineContent = boldParts.map((boldPart, boldIndex) => {
              if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                return <strong key={boldIndex} className="font-bold text-slate-900">{boldPart.slice(2, -2)}</strong>;
              }

              // Parse inline code elements (`code`)
              const inlineCodeParts = boldPart.split(/(`.*?`)/g);
              return inlineCodeParts.map((icPart, icIndex) => {
                if (icPart.startsWith('`') && icPart.endsWith('`')) {
                  return (
                    <code key={icIndex} className="px-1.5 py-0.5 mx-0.5 bg-slate-100 text-pink-600 rounded text-xs font-mono font-semibold border border-slate-200">
                      {icPart.slice(1, -1)}
                    </code>
                  );
                }
                return icPart;
              });
            });

            if (isBullet) {
              return (
                <span key={lineIndex} className="flex items-start my-1 pl-4 relative">
                  <span className="absolute left-1 top-2 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 leading-relaxed text-[13.5px]">{lineContent}</span>
                </span>
              );
            }

            if (isNumbered) {
              const prefixMatch = line.trim().match(/^(\d+)\./);
              const num = prefixMatch ? prefixMatch[1] : '1';
              return (
                <span key={lineIndex} className="flex items-start my-1 pl-4 relative">
                  <span className="absolute left-1 text-[11px] font-bold text-violet-500">{num}.</span>
                  <span className="text-slate-700 leading-relaxed text-[13.5px]">{lineContent}</span>
                </span>
              );
            }

            return (
              <span key={lineIndex} className="block text-slate-700 leading-relaxed text-[13.5px] my-1">
                {lineContent}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const quickSuggestions = [
    { text: 'Explain photosynthesis simply.', label: 'Biology' },
    { text: 'How do quadratic equations work?', label: 'Math' },
    { text: 'Write a basic Python function for Fibonacci.', label: 'Coding' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[400px] h-[550px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          
          {/* Header section with glassmorphism gradient */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-violet-200 animate-pulse" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  TuteAI Assistant
                </h4>
                <p className="text-[10px] text-indigo-200 flex items-center gap-1">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset/Clear chat */}
              <button 
                onClick={handleClearChat} 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-150 tooltip"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4 text-white/90 hover:text-white" />
              </button>
              
              {/* Close window */}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-150"
              >
                <X className="w-4 h-4 text-white/90 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Messages list area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-[13.5px]">{msg.content}</p>
                  ) : (
                    <div>{formatMarkdown(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Pulsating AI loading/thinking state */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium italic">TuteAI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error box */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-800">Connection Error</p>
                  <p className="text-rose-600 mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions (only show when no pending operation & minor history) */}
          {!isLoading && messages.length <= 3 && !error && (
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                Quick Study Prompts
              </p>
              <div className="flex flex-col gap-1.5">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(suggestion.text)}
                    className="w-full text-left bg-white hover:bg-violet-50 hover:border-violet-200 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-violet-700 transition-all duration-150 shadow-sm flex items-center justify-between"
                  >
                    <span className="truncate">{suggestion.text}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      {suggestion.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your lessons..."
              disabled={isLoading}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-150 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 relative group"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 animate-pulse" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-400 rounded-full flex items-center justify-center border-2 border-white">
              <Sparkles className="w-2.5 h-2.5 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </span>
          </>
        )}
        
        {/* Hover label */}
        {!isOpen && (
          <span className="absolute right-16 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none">
            Ask TuteAI Tutor ✨
          </span>
        )}
      </button>
    </div>
  );
}
