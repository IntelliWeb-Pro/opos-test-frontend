'use client';

import { useState, useEffect, useRef } from 'react';
import { SendHorizonal } from 'lucide-react';

export default function IAChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (data?.response) {
        const iaMessage = { role: 'ia', content: data.response };
        setMessages((prev) => [...prev, iaMessage]);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="max-w-2xl mx-auto border border-gray-300 rounded-2xl shadow-lg flex flex-col h-[80vh] bg-white overflow-hidden">
      <div className="bg-blue-600 text-white text-center py-4 font-semibold text-lg border-b">
        Asistente Inteligente
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`transition-all duration-300 max-w-[80%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 text-right self-end ml-auto'
                : 'bg-gray-100 text-left self-start mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm animate-pulse bg-gray-100 px-4 py-2 rounded-xl max-w-[80%]">
            Pensando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-4 flex items-center bg-gray-50">
        <input
          type="text"
          className="flex-1 p-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Pregúntale a la IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
    </div>
  );
}
