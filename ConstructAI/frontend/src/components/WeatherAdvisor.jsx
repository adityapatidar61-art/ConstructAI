import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { CloudRain, Sun, Wind, Umbrella } from 'lucide-react'
import { API, arr } from '../api'

const WeatherAdvisor = () => {
  const [activity, setActivity] = useState('Slab Conversion')
  const [weather, setWeather] = useState('Rainy')
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/weather-advisor`, {
        activity: activity,
        weather: weather,
      })
      setAdvice(res.data)
    } catch (error) {
      console.error(error)
      alert('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const decision = (advice?.decision || '').toLowerCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Weather Advisor</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3><CloudRain size={16} /> Conditions</h3>
          <label>Planned Activity</label>
          <input value={activity} onChange={(e) => setActivity(e.target.value)} />
          <label>Weather</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option>Rainy</option>
            <option>Sunny / Hot</option>
            <option>Windy</option>
            <option>Foggy</option>
            <option>Thunderstorm</option>
            <option>Cold</option>
          </select>
          <div style={{ display: 'flex', gap: 12, marginTop: 14, color: '#999' }}>
            <Sun size={18} /><Wind size={18} /><Umbrella size={18} />
          </div>
          <button className="btn" disabled={loading}>{loading ? 'Analyzing...' : 'Get Advisory'}</button>
        </form>

        <div className="card">
          <h3>Advisory</h3>
          {!advice ? (
            <div className="placeholder">Waiting for input...</div>
          ) : (
            <>
              <span className={`badge ${decision}`} style={{ fontSize: '1.1rem' }}>{advice.decision}</span>
              {advice.summary && <p style={{ fontSize: '0.9rem' }}>{advice.summary}</p>}
              <div className="section-title red">Risks</div>
              <ul className="clean red">{arr(advice.risks).map((r, i) => <li key={i}>{String(r)}</li>)}</ul>
              <div className="section-title blue">Precautions</div>
              <ul className="clean">{arr(advice.precautions).map((p, i) => <li key={i}>{String(p)}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherAdvisor
