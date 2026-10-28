import React, { useState } from 'react'
import { Upload, AlertTriangle, CheckCircle, FileText, X } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { API, arr } from '../api'

const EMPTY = {
  hazards: [],
  risk_level: '',
  missing_ppe: [],
  recommended_ppe: [],
  osha_standards: [],
  corrective_actions: [],
  summary: '',
}

const SafetyMonitor = () => {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [doc, setDoc] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('text', text)
    if (image) formData.append('image', image)
    if (doc) formData.append('doc', doc)

    try {
      const res = await axios.post(`${API}/api/safety-monitor`, formData)
      setResult({ ...EMPTY, ...res.data })
      if (res.data?.error) setError(res.data.error)
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const risk = (result?.risk_level || '').toLowerCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Site Safety Monitor</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3><FileText size={16} /> Input Data</h3>
          <label>Observation Log</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the scene e.g. 'Workers on scaffold without harness...'"
          />

          <label>Site Photo (Optional)</label>
          <label className="upload-box">
            <Upload size={20} />
            {image ? image.name : 'Click to Upload Image'}
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
          </label>

          <label>Safety Doc (Optional)</label>
          <label className="upload-box orange">
            <FileText size={20} />
            {doc ? doc.name : 'Click to Upload Report'}
            <input type="file" accept=".txt,.md,.csv" onChange={(e) => setDoc(e.target.files[0] || null)} />
          </label>
          {(image || doc) && (
            <button type="button" className="tag" style={{ marginTop: 8, cursor: 'pointer', border: 0 }}
              onClick={() => { setImage(null); setDoc(null) }}>
              <X size={12} /> Clear files
            </button>
          )}

          <button className="btn" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Hazards'}</button>
        </form>

        <div className="card">
          <h3>Analysis Results</h3>
          {error && <div className="error-box">{error}</div>}
          {!result ? (
            <div className="placeholder">Waiting for input...</div>
          ) : (
            <>
              <span className={`badge ${risk}`}>Risk: {result.risk_level || 'Unknown'}</span>
              {result.summary && <p style={{ fontSize: '0.9rem' }}>{result.summary}</p>}

              <div className="section-title red"><AlertTriangle size={14} /> Hazards</div>
              <ul className="clean red">{arr(result.hazards).map((h, i) => <li key={i}>{String(h)}</li>)}</ul>

              <div className="section-title">Missing PPE</div>
              <div className="tags">{arr(result.missing_ppe).map((p, i) => <span className="tag" key={i}>{String(p)}</span>)}</div>

              <div className="section-title blue">Recommended PPE</div>
              <div className="tags">{arr(result.recommended_ppe).map((p, i) => <span className="tag" key={i}>{String(p)}</span>)}</div>

              <div className="section-title"><CheckCircle size={14} /> Corrective Actions</div>
              <ul className="clean">{arr(result.corrective_actions).map((a, i) => <li key={i}>{String(a)}</li>)}</ul>

              <div className="section-title blue">Standards</div>
              <ul className="clean">{arr(result.osha_standards).map((s, i) => <li key={i}>{String(s)}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SafetyMonitor
