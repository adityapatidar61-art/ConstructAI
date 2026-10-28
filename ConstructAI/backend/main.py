"""ConstructAI backend - FastAPI + Groq (Meta LLaMA multimodal)."""
import os
import json
import base64
import re
from typing import Optional
from urllib.parse import quote

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

app = FastAPI(title="ConstructAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# System prompt and per-feature schemas (data contracts)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are ConstructAI, an expert assistant for the construction industry in India.
You support site engineers, contractors and project managers. Rules:
1. Stay strictly within the construction domain (safety, structures, planning, costing, valuation, site operations, weather).
2. Respond with ONE valid JSON object only. No markdown, no code fences, no commentary.
3. Use exactly the keys requested for the ACTIVE FEATURE. Never omit a key; use [] or "" if unknown.
4. All money values are numbers in Indian Rupees (INR) with no symbols or commas.
5. Be concise and actionable. You assist professional judgement, you do not replace it."""

FEATURE_GUIDE = {
    "safety_monitor": (
        "Analyse the construction site (image and/or text) for safety compliance. Look at worker positioning, "
        "PPE, scaffolding/elevated work, debris, open edges, lighting. "
        'Keys: {"hazards": [str], "risk_level": "Low|Medium|High|Critical", "missing_ppe": [str], '
        '"recommended_ppe": [str], "osha_standards": [str], "corrective_actions": [str], "summary": str}'
    ),
    "crack_detection": (
        "Analyse the structural crack (image and/or description). "
        'Keys: {"crack_type": "hairline|vertical|diagonal|horizontal|structural|other", '
        '"severity": "Minor|Moderate|Severe", "causes": [str], "risks": [str], '
        '"repair_methods": [str], "preventive_measures": [str], "summary": str}'
    ),
    "real_estate_valuation": (
        "Estimate property value for the Indian market using the given inputs. "
        'Keys: {"estimated_value_min": number, "estimated_value_max": number, "price_per_sqft": number, '
        '"monthly_rent": number, "roi_percent": number, "appreciation_outlook": str, "summary": str}'
    ),
    "project_planner": (
        "Create a construction plan using Indian thumb rules and city-based costs. "
        'Keys: {"materials": {"cement_bags": number, "sand_cubic_ft": number, "aggregate_cubic_ft": number, '
        '"steel_kg": number}, "cost": {"materials": number, "labour": number, "finishing": number, '
        '"other": number, "total": number}, "schedule": [{"phase": str, "duration_weeks": number, '
        '"tasks": [str]}], "visualization_prompt": str, "summary": str}'
    ),
    "knowledge_base": (
        "Generate a concise construction knowledge document for the requested topic. "
        'Keys: {"title": str, "sections": [{"heading": str, "content": str}], "key_points": [str]}'
    ),
    "chatbot": (
        "Answer the construction question concisely and practically. "
        'Keys: {"reply": str, "action_suggestions": [str]}'
    ),
    "daily_site_assistant": (
        "Create today's execution plan for the site. "
        'Keys: {"tasks": [str], "materials_equipment": [str], "safety_checks": [str], "risk_alerts": [str]}'
    ),
    "weather_advisor": (
        "Decide GO / NO-GO for the activity under the weather. "
        'Keys: {"decision": "GO|NO-GO", "risks": [str], "precautions": [str], "summary": str}'
    ),
}

DEFAULTS = {
    "safety_monitor": {
        "hazards": [], "risk_level": "Unknown", "missing_ppe": [], "recommended_ppe": [],
        "osha_standards": [], "corrective_actions": [], "summary": "",
    },
    "crack_detection": {
        "crack_type": "Unknown", "severity": "Unknown", "causes": [], "risks": [],
        "repair_methods": [], "preventive_measures": [], "summary": "",
    },
    "real_estate_valuation": {
        "estimated_value_min": 0, "estimated_value_max": 0, "price_per_sqft": 0,
        "monthly_rent": 0, "roi_percent": 0, "appreciation_outlook": "", "summary": "",
    },
    "project_planner": {
        "materials": {"cement_bags": 0, "sand_cubic_ft": 0, "aggregate_cubic_ft": 0, "steel_kg": 0},
        "cost": {"materials": 0, "labour": 0, "finishing": 0, "other": 0, "total": 0},
        "schedule": [], "visualization_prompt": "", "summary": "",
    },
    "knowledge_base": {"title": "", "sections": [], "key_points": []},
    "chatbot": {"reply": "", "action_suggestions": []},
    "daily_site_assistant": {"tasks": [], "materials_equipment": [], "safety_checks": [], "risk_alerts": []},
    "weather_advisor": {"decision": "NO-GO", "risks": [], "precautions": [], "summary": ""},
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def encode_image(image_file: UploadFile) -> str:
    content = await image_file.read()
    return base64.b64encode(content).decode("utf-8")


def extract_json(text: str) -> dict:
    """Pull a JSON object out of the model reply, even if it was wrapped in text."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    raise ValueError("No JSON found in model output")


def to_number(value, default=0):
    try:
        if isinstance(value, str):
            value = re.sub(r"[^\d.\-]", "", value)
        return float(value)
    except Exception:
        return default


def normalize(data, defaults):
    """Guarantee every key exists with the right type (frontend-safe)."""
    if not isinstance(data, dict):
        data = {}
    out = dict(data)
    for key, default in defaults.items():
        value = data.get(key)
        if isinstance(default, dict):
            out[key] = normalize(value, default)
        elif isinstance(default, list):
            if isinstance(value, list):
                out[key] = value
            elif value in (None, ""):
                out[key] = []
            else:
                out[key] = [value]
        elif isinstance(default, (int, float)):
            out[key] = to_number(value, default)
        else:
            out[key] = default if value is None else (value if isinstance(value, str) else str(value))
    return out


async def query_ai(feature: str, user_inputs: dict, image_file: Optional[UploadFile] = None):
    """Single, reusable AI handler for every feature."""
    defaults = DEFAULTS[feature]
    if client is None:
        result = normalize({}, defaults)
        result["error"] = "GROQ_API_KEY is not set. Add it to backend/.env"
        return result

    input_text = f"ACTIVATE FEATURE: {feature}\n{FEATURE_GUIDE[feature]}\nINPUT DATA:\n"
    for k, v in user_inputs.items():
        input_text += f"{k}: {v}\n"

    user_content = [{"type": "text", "text": input_text}]
    if image_file is not None and getattr(image_file, "filename", ""):
        b64 = await encode_image(image_file)
        if b64:
            user_content.append(
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content
        return normalize(extract_json(raw), defaults)
    except Exception as exc:  # fallback keeps the UI alive
        result = normalize({}, defaults)
        result["error"] = f"AI request failed: {exc}"
        return result


def image_url_from_prompt(prompt: str) -> str:
    prompt = prompt or "modern residential building under construction, architectural render"
    return f"https://image.pollinations.ai/prompt/{quote(prompt)}?width=768&height=512&nologo=true"


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    query: str


class SiteAssistantRequest(BaseModel):
    activity: str = "Concreting"
    labour_count: int = 10
    site_condition: str = "Normal"


class WeatherRequest(BaseModel):
    activity: str = "Slab Conversion"
    weather: str = "Rainy"


class PlannerRequest(BaseModel):
    plot_area: str = ""
    construction_type: str = "Residential"
    city: str = ""
    description: str = ""


class KnowledgeRequest(BaseModel):
    topic: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ConstructAI API online", "model": MODEL, "ai_configured": client is not None}


@app.post("/api/safety-monitor")
async def safety_monitor(
    text: str = Form(""),
    image: Optional[UploadFile] = File(None),
    doc: Optional[UploadFile] = File(None),
):
    inputs = {"observation_log": text or "No description provided"}
    if doc is not None and getattr(doc, "filename", ""):
        raw = await doc.read()
        inputs["safety_document_excerpt"] = raw.decode("utf-8", errors="ignore")[:4000]
    return await query_ai("safety_monitor", inputs, image)


@app.post("/api/crack-detection")
async def crack_detection(text: str = Form(""), image: Optional[UploadFile] = File(None)):
    return await query_ai("crack_detection", {"description": text or "No description provided"}, image)


@app.post("/api/real-estate-valuation")
async def real_estate_valuation(
    location: str = Form(""),
    area: str = Form(""),
    property_type: str = Form("Residential"),
    building_age: str = Form(""),
    amenities: str = Form(""),
):
    inputs = {
        "location": location or "Unknown",
        "area_sqft": area or "Unknown",
        "property_type": property_type,
        "building_age_years": building_age or "Unknown",
        "amenities": amenities or "None",
    }
    return await query_ai("real_estate_valuation", inputs)


@app.post("/api/project-planner")
async def project_planner(req: PlannerRequest):
    inputs = {
        "plot_area_sqft": req.plot_area or "1200",
        "construction_type": req.construction_type,
        "city": req.city or "Bhopal",
        "extra_description": req.description or "None",
    }
    result = await query_ai("project_planner", inputs)
    result["visualization_url"] = image_url_from_prompt(
        result.get("visualization_prompt")
        or f"{req.construction_type} building, {req.city}, India, architectural visualization"
    )
    return result


@app.post("/api/knowledge-base")
async def knowledge_base(req: KnowledgeRequest):
    return await query_ai("knowledge_base", {"topic": req.topic})


@app.post("/api/chatbot")
async def chatbot(req: ChatRequest):
    return await query_ai("chatbot", {"question": req.query})


@app.post("/api/site-assistant")
async def site_assistant(req: SiteAssistantRequest):
    return await query_ai(
        "daily_site_assistant",
        {"activity": req.activity, "labour_count": req.labour_count, "site_condition": req.site_condition},
    )


@app.post("/api/weather-advisor")
async def weather_advisor(req: WeatherRequest):
    return await query_ai("weather_advisor", {"activity": req.activity, "weather": req.weather})
