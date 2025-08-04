import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'

export default function IAChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (data && data.response) {
        const iaMessage = { role: 'ia', content: data.response }
        setMessages((prev) => [...prev, iaMessage])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="flex flex-col border rounded-2xl shadow-md p-4 max-w-xl mx-auto">
      <div className="overflow-y-auto max-h-80 mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-gray-100 self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Pensando...</div>}
      </div>
      <div className="flex items-center border-t pt-2">
        <input
          type="text"
          className="flex-1 p-2 rounded-xl border mr-2 text-sm"
          placeholder="Pregúntale a la IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl"
        >
          <SendHorizonal size={16} />
        </button>
      </div>
    </div>
  )
}
