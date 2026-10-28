import React, { useState } from 'react'
import { Building2, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { API, inr, num } from '../api'

const Valuation = () => {
  const [form, setForm] = useState({
    location: '',
    area: '',
    property_type: 'Residential',
    building_age: '',
    amenities: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData()
    Object.keys(form).forEach((key) => formData.append(key, form[key]))

    try {
      const response = await axios.post(`${API}/api/real-estate-valuation`, formData)
      setResult(response.data)
      if (response.data?.error) setError(response.data.error)
    } catch (err) {
      console.error(err)
      setError('Valuation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Real Estate Estimator</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3><Building2 size={16} /> Property Details</h3>
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Arera Colony, Bhopal" required />
          <label>Area (sq ft)</label>
          <input name="area" type="number" value={form.area} onChange={handleChange} placeholder="1200" required />
          <label>Property Type</label>
          <select name="property_type" value={form.property_type} onChange={handleChange}>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Plot / Land</option>
            <option>Villa</option>
          </select>
          <label>Building Age (years)</label>
          <input name="building_age" type="number" value={form.building_age} onChange={handleChange} placeholder="5" />
          <label>Amenities</label>
          <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Parking, Lift, Garden" />
          <button className="btn" disabled={loading}>{loading ? 'Estimating...' : 'Estimate Value'}</button>
        </form>

        {result && (
          <div className="card">
            <h3><TrendingUp size={16} /> Valuation</h3>
            {error && <div className="error-box">{error}</div>}
            <div className="stat-big">{inr(result.estimated_value_min)} – {inr(result.estimated_value_max)}</div>
            <div className="stat"><span>Price per sq ft</span><b>{inr(result.price_per_sqft)}</b></div>
            <div className="stat"><span>Monthly Rent</span><b>{inr(result.monthly_rent)}</b></div>
            <div className="stat"><span>ROI</span><b>{num(result.roi_percent)}%</b></div>
            <div className="section-title">Appreciation Outlook</div>
            <p style={{ fontSize: '0.9rem' }}>{result.appreciation_outlook}</p>
            {result.summary && <p style={{ fontSize: '0.85rem', color: '#666' }}>{result.summary}</p>}
            <p style={{ fontSize: '0.7rem', color: '#888' }}>Indicative AI estimate, not a formal valuation.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Valuation
