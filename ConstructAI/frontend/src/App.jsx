import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  ShieldAlert,
  Activity,
  Building2,
  ClipboardList,
  BookOpen,
  HardHat,
  MessageSquare,
  CheckSquare,
  CloudRain,
} from 'lucide-react'
import SafetyMonitor from './components/SafetyMonitor'
import CrackDetection from './components/CrackDetection'
import Valuation from './components/Valuation'
import ProjectPlanner from './components/ProjectPlanner'
import KnowledgeBase from './components/KnowledgeBase'
import ConstructionChatbot from './components/ConstructionChatbot'
import DailySiteAssistant from './components/DailySiteAssistant'
import WeatherAdvisor from './components/WeatherAdvisor'

const link = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardHat size={32} color="var(--orange)" />
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>
              Construct<span className="text-orange">AI</span>
            </h2>
          </div>

          <nav>
            <NavLink to="/safety" className={link}><ShieldAlert size={18} /> Safety Monitor</NavLink>
            <NavLink to="/crack-detection" className={link}><Activity size={18} /> Crack Detection</NavLink>
            <NavLink to="/valuation" className={link}><Building2 size={18} /> Real Estate Valuation</NavLink>
            <NavLink to="/planner" className={link}><ClipboardList size={18} /> Project Planner</NavLink>
            <NavLink to="/knowledge" className={link}><BookOpen size={18} /> Knowledge Base</NavLink>
            <div className="nav-sep" />
            <NavLink to="/chatbot" className={link}><MessageSquare size={18} /> Chatbot</NavLink>
            <NavLink to="/site-assistant" className={link}><CheckSquare size={18} /> Daily Site Assistant</NavLink>
            <NavLink to="/weather" className={link}><CloudRain size={18} /> Weather Advisor</NavLink>
          </nav>

          <div className="sidebar-footer">
            <div>v1.0.0 ConstructionGPT</div>
            <div>System Online</div>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/safety" replace />} />
            <Route path="/safety" element={<SafetyMonitor />} />
            <Route path="/crack-detection" element={<CrackDetection />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/planner" element={<ProjectPlanner />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/chatbot" element={<ConstructionChatbot />} />
            <Route path="/site-assistant" element={<DailySiteAssistant />} />
            <Route path="/weather" element={<WeatherAdvisor />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
