# ConstructAI

An AI-powered construction decision-support platform. It combines a **FastAPI** backend, a **React + Vite** frontend and **Meta LLaMA** (multimodal, via Groq) to help site engineers, contractors and project managers with safety, structural inspection, planning and valuation.

## Features

| Module | What it does |
|---|---|
| Safety Monitor | Analyses site photos/text for hazards, missing PPE, risk level and corrective actions |
| Crack Detection | Classifies crack type and severity, likely causes, repair and prevention steps |
| Real Estate Valuation | Value range, price per sq ft, rent, ROI and outlook in Indian Rupees (₹) |
| Project Planner | Materials, cost breakdown (₹), phase-wise schedule and an AI concept image (Pollinations/Flux) |
| Knowledge Base | Generates short construction reference documents on any topic |
| Chatbot | Construction Q&A with suggested next actions |
| Daily Site Assistant | Daily tasks, safety checks, equipment and risk alerts |
| Weather Advisor | GO / NO-GO decision with risks and precautions |

All AI replies are forced into strict JSON schemas and validated on the backend, with safe defaults, so the frontend never crashes on missing data.

## Tech stack

Python 3.9+, FastAPI, Uvicorn, Pydantic, python-multipart, python-dotenv, Groq SDK, React 18, Vite, Axios, Framer Motion, Lucide icons.

## Project structure

```
ConstructAI/
├── backend/
│   ├── main.py            # API + central AI handler (query_ai)
│   ├── requirements.txt
│   └── .env.example       # copy to .env and add your key
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css
        └── components/    # one file per feature
```

## Setup

### 1. Get a Groq API key
Create a free account at https://console.groq.com and generate an API key.

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env        # Mac/Linux: cp .env.example .env
# open .env and paste your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```
Check http://localhost:8000 - you should see `"ai_configured": true`.

### 3. Frontend (new terminal)
Install Node.js (LTS) from https://nodejs.org first.
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

If your backend runs elsewhere, create `frontend/.env` with `VITE_API_URL=http://your-backend-url`.

## API endpoints

| Method | Path | Input |
|---|---|---|
| POST | `/api/safety-monitor` | form: text, image?, doc? |
| POST | `/api/crack-detection` | form: text, image? |
| POST | `/api/real-estate-valuation` | form: location, area, property_type, building_age, amenities |
| POST | `/api/project-planner` | JSON: plot_area, construction_type, city, description |
| POST | `/api/knowledge-base` | JSON: topic |
| POST | `/api/chatbot` | JSON: query |
| POST | `/api/site-assistant` | JSON: activity, labour_count, site_condition |
| POST | `/api/weather-advisor` | JSON: activity, weather |

## Limitations

AI output is indicative and assists, but does not replace, professional engineering judgement. Valuations and cost estimates are approximations. Never commit your `.env` file.

## Future enhancements

Live weather API integration, user accounts and saved reports, PDF export, Docker deployment.
