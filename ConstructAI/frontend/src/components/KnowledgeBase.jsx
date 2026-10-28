import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { API, arr } from '../api'

const KnowledgeBase = () => {
  const [topic, setTopic] = useState('')
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/api/knowledge-base`, { topic })
      setDoc(res.data)
      if (res.data?.error) setError(res.data.error)
    } catch (err) {
      console.error(err)
      setError('Could not generate document. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Knowledge Base</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3><BookOpen size={16} /> Generate Document</h3>
          <label>Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Curing of concrete, Scaffolding safety checklist" />
          <button className="btn" disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
        </form>

        <div className="card">
          <h3>{doc?.title || 'Document'}</h3>
          {error && <div className="error-box">{error}</div>}
          {!doc ? (
            <div className="placeholder">Waiting for input...</div>
          ) : (
            <>
              {arr(doc.sections).map((s, i) => (
                <div key={i}>
                  <div className="section-title">{s?.heading}</div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{s?.content}</p>
                </div>
              ))}
              <div className="section-title blue">Key Points</div>
              <ul className="clean">{arr(doc.key_points).map((k, i) => <li key={i}>{String(k)}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default KnowledgeBase
