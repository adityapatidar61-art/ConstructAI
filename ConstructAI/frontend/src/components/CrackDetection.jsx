import React, { useState } from 'react'
import { Upload, Activity, AlertOctagon } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { API, arr } from '../api'

const CrackDetection = () => {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
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

    try {
      const response = await axios.post(`${API}/api/crack-detection`, formData)
      setResult(response.data)
      if (response.data?.error) setError(response.data.error)
    } catch (err) {
      console.error(err)
      setError('Diagnosis failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const sev = (result?.severity || '').toLowerCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Structural Crack Diagnosis</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Input Analysis Data</h3>
          <label>Description</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Describe the crack location and pattern..." />
          <label>Crack Image</label>
          <label className="upload-box">
            <Upload size={20} />
            {image ? image.name : 'Upload Close-up'}
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
          </label>
          <button className="btn" disabled={loading}>{loading ? 'Analyzing...' : 'Run Diagnosis'}</button>
        </form>

        {result && (
          <div className="card">
            <h3><Activity size={16} /> Diagnosis</h3>
            {error && <div className="error-box">{error}</div>}
            <div className="stat"><span>Crack Type</span><b>{result.crack_type}</b></div>
            <div className="stat"><span>Severity</span><span className={`badge ${sev}`}>{result.severity}</span></div>
            {result.summary && <p style={{ fontSize: '0.9rem' }}>{result.summary}</p>}

            <div className="section-title">Probable Causes</div>
            <ul className="clean">{arr(result.causes).map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
            <div className="section-title red"><AlertOctagon size={14} /> Risks</div>
            <ul className="clean red">{arr(result.risks).map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
            <div className="section-title blue">Repair Methods</div>
            <ul className="clean">{arr(result.repair_methods).map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
            <div className="section-title">Preventive Measures</div>
            <ul className="clean">{arr(result.preventive_measures).map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CrackDetection
