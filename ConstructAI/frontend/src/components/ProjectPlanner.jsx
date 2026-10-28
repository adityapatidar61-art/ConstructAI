import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { API, arr, inr, num } from '../api'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#FF7600', textAlign: 'center', border: '1px solid #FF7600', borderRadius: 4 }}>
          Project Planner failed. Please retry.
        </div>
      )
    }
    return this.props.children
  }
}

// STEP 1 - safe state initialisation
const EMPTY_PLAN = {
  materials: { cement_bags: 0, sand_cubic_ft: 0, aggregate_cubic_ft: 0, steel_kg: 0 },
  cost: { materials: 0, labour: 0, finishing: 0, other: 0, total: 0 },
  schedule: [],
  visualization_url: '',
  summary: '',
}

const ProjectPlannerContent = () => {
  const [form, setForm] = useState({ plot_area: '', construction_type: 'Residential', city: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [plan, setPlan] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/api/project-planner`, form)
      setPlan({
        ...EMPTY_PLAN,
        ...res.data,
        materials: { ...EMPTY_PLAN.materials, ...(res.data?.materials || {}) },
        cost: { ...EMPTY_PLAN.cost, ...(res.data?.cost || {}) },
      })
      if (res.data?.error) setError(res.data.error)
    } catch (err) {
      console.error(err)
      setError('Planning failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Project Planner</h1>
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Project Inputs</h3>
          <label>Plot Area (sq ft)</label>
          <input name="plot_area" type="number" value={form.plot_area} onChange={handleChange} placeholder="1200" required />
          <label>Construction Type</label>
          <select name="construction_type" value={form.construction_type} onChange={handleChange}>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Duplex</option>
            <option>Apartment Block</option>
          </select>
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} placeholder="Bhopal" required />
          <label>Extra Notes (optional)</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="G+1, 3BHK, vitrified flooring..." />
          <button className="btn" disabled={loading}>{loading ? 'Planning...' : 'Generate Plan'}</button>
        </form>

        <div className="card">
          <h3>Project Plan</h3>
          {error && <div className="error-box">{error}</div>}
          {!plan ? (
            <div className="placeholder">Waiting for input...</div>
          ) : (
            <>
              <div className="stat-big">Total: {inr(plan.cost.total)}</div>
              {plan.summary && <p style={{ fontSize: '0.9rem' }}>{plan.summary}</p>}

              <div className="section-title">Materials</div>
              <div className="stat"><span>Cement (bags)</span><b>{num(plan.materials.cement_bags)}</b></div>
              <div className="stat"><span>Sand (cu ft)</span><b>{num(plan.materials.sand_cubic_ft)}</b></div>
              <div className="stat"><span>Aggregate (cu ft)</span><b>{num(plan.materials.aggregate_cubic_ft)}</b></div>
              <div className="stat"><span>Steel (kg)</span><b>{num(plan.materials.steel_kg)}</b></div>

              <div className="section-title blue">Cost Breakdown</div>
              <div className="stat"><span>Materials</span><b>{inr(plan.cost.materials)}</b></div>
              <div className="stat"><span>Labour</span><b>{inr(plan.cost.labour)}</b></div>
              <div className="stat"><span>Finishing</span><b>{inr(plan.cost.finishing)}</b></div>
              <div className="stat"><span>Other</span><b>{inr(plan.cost.other)}</b></div>

              <div className="section-title">Schedule</div>
              <table>
                <tbody>
                  {arr(plan.schedule).map((s, i) => (
                    <tr key={i}>
                      <td><b>{s?.phase}</b></td>
                      <td>{num(s?.duration_weeks)} wk</td>
                      <td>{arr(s?.tasks).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {plan.visualization_url && (
                <>
                  <div className="section-title blue">Conceptual Visualization</div>
                  <img className="viz" src={plan.visualization_url} alt="AI construction visualization" />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ProjectPlanner = () => (
  <ErrorBoundary>
    <ProjectPlannerContent />
  </ErrorBoundary>
)

export default ProjectPlanner
