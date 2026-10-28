import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { MessageSquare, Send } from 'lucide-react'
import { API, arr } from '../api'

const ConstructionChatbot = () => {
  const [query, setQuery] = useState('')
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMsg = { role: 'user', text: query }
    setConversation((prev) => [...prev, userMsg])
    setLoading(true)
    setQuery('')

    try {
      const res = await axios.post(`${API}/api/chatbot`, { query: userMsg.text })
      const aiMsg = {
        role: 'ai',
        text: res.data.reply || 'I could not generate a reply.',
        suggestions: arr(res.data.action_suggestions),
      }
      setConversation((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error(error)
      setConversation((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1><MessageSquare size={28} /> Chatbot</h1>
      <div className="card">
        <div className="chat-window">
          {conversation.length === 0 && (
            <div className="placeholder">Ask anything about construction: materials, safety, methods, costs...</div>
          )}
          {conversation.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.text}
              {arr(m.suggestions).map((s, j) => <span className="suggest" key={j}>{String(s)}</span>)}
            </div>
          ))}
          {loading && <div className="msg ai">Thinking...</div>}
        </div>
        <form className="chat-form" onSubmit={handleSubmit}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type your construction question..." />
          <button type="submit" disabled={loading}><Send size={18} /></button>
        </form>
      </div>
    </motion.div>
  )
}

export default ConstructionChatbot
