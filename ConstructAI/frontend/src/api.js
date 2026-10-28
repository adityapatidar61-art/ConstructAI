export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Frontend-safe helpers: never crash on undefined/odd data
export const arr = (x) => (Array.isArray(x) ? x : [])
export const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0)
export const inr = (x) => '₹' + num(x).toLocaleString('en-IN', { maximumFractionDigits: 0 })
