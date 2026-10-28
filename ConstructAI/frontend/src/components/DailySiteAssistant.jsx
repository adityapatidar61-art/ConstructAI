import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, AlertTriangle, Hammer } from 'lucide-react'
import { API, arr } from '../api'

const DailySiteAssistant = () => {
  const [activity, setActivity] = useState('Concreting')
  const [labour, setLabour] = useState(10)
  const [condition, setCondition] = useState('Normal')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/site-assistant`, {
        activity: activity,
        labour_count: parseInt(labour) || 0,
        site_condition: condition,
      })
      setPlan(res.data)
    } catch (error) {
      console.error(error)
      alert('Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Daily Site Assistant</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Site Input</h3>
          <label>Planned Activity</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option>Concreting</option>
            <option>Excavation</option>
            <option>Brickwork</option>
            <option>Plastering</option>
            <option>Steel Fixing</option>
            <option>Shuttering</option>
            <option>Slab Casting</option>
          </select>
          <label>Labour Count</label>
          <input type="number" min="0" value={labour} onChange={(e) => setLabour(e.target.value)} />
          <label>Site Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>Normal</option>
            <option>Muddy</option>
            <option>Congested</option>
            <option>Hot &amp; Humid</option>
            <option>Windy</option>
          </select>
          <button className="btn" disabled={loading}>{loading ? 'Generating...' : "Generate Today's Plan"}</button>
        </form>

        <div className="card">
          <h3>Today's Execution Plan</h3>
          {!plan ? (
            <div className="placeholder">Waiting for input...</div>
          ) : (
            <>
              <div className="section-title"><Hammer size={14} /> Tasks</div>
              <ul className="clean">{arr(plan.tasks).map((t, i) => <li key={i}>{String(t)}</li>)}</ul>

              <div className="section-title blue"><CheckCircle size={14} /> Safety Checks</div>
              <div className="tags">{arr(plan.safety_checks).map((s, i) => <span className="tag" key={i}>{String(s)}</span>)}</div>

              <div className="section-title"><Calendar size={14} /> Materials &amp; Equipment</div>
              <ul className="clean">{arr(plan.materials_equipment).map((m, i) => <li key={i}>{String(m)}</li>)}</ul>

              <div className="section-title red"><AlertTriangle size={14} /> Risk Alerts</div>
              <ul className="clean red">{arr(plan.risk_alerts).map((r, i) => <li key={i}>{String(r)}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DailySiteAssistant
