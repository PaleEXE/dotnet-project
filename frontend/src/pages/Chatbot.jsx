import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Link } from 'react-router-dom';

const RAG_API = 'http://localhost:5001/api/chatbot';

const Chatbot = () => {
  const { t, dir } = useI18n();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. Tell me what kind of volunteer opportunities or tasks you're looking for, and I'll find the best matches for you!",
      suggestedItems: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${RAG_API}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.reply,
        suggestedItems: data.suggested_items || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error communicating with RAG API:", error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't connect to the recommendation service right now. Please make sure the Python backend is running on port 5001." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-offwhite relative rounded-2xl overflow-hidden shadow-xl border border-earth/20 mt-4 mx-2 sm:mx-0">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-earth/90 to-earth/70 backdrop-blur-md p-4 text-white shadow-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse shadow-inner">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <h2 className="font-bold tracking-wide">AI Recommendation Assistant</h2>
            <p className="text-xs text-white/80">Powered by RAG</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-sand/5">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-earth text-white rounded-br-sm' 
                  : 'bg-white border border-sand text-ink rounded-bl-sm shadow-[0_4px_20px_rgba(140,120,89,0.08)] backdrop-blur-lg'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{msg.content}</p>
            </div>
            
            {/* Suggested Items */}
            {msg.suggestedItems && msg.suggestedItems.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 max-w-[90%]">
                {msg.suggestedItems.map((item, idx) => (
                  <div key={idx} className="bg-white border border-earth/20 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-64 cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-earth text-sm line-clamp-1 group-hover:text-earth/80 transition-colors">{item.title}</h4>
                      {item.score && <span className="text-[10px] bg-sand/30 text-earth px-2 py-1 rounded-full font-semibold">{Math.round((1 - item.score) * 100)}% Match</span>}
                    </div>
                    <p className="text-xs text-ink/70 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(item.tags || '').split(/[,;]+/).map(tag => tag.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] bg-sand/20 text-earth px-2 py-0.5 rounded-md">#{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-sand rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-earth/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-earth/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-earth/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-earth/10 z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your interests... (e.g. 'I want to work with animals')"
            className="w-full bg-sand/10 border border-sand/50 rounded-full py-3 pl-6 pr-14 text-ink focus:outline-none focus:ring-2 focus:ring-earth/50 transition-all placeholder:text-ink/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-earth text-white rounded-full flex items-center justify-center hover:bg-earth/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
