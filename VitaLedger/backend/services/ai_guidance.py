import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_ai_guidance(diagnosis: str) -> str:
    """Generate lifestyle guidance based on the diagnosis using Gemini AI."""
    if not diagnosis:
        return "No diagnosis provided."
        
    if not API_KEY or API_KEY == "AIzaSyBeOqa3mOftaQUa0Sf5sXjXBneTcUytW6g":
        
        return f"• Follow standard care plan for {diagnosis}.\n• Keep active daily.\n• Consult physician if symptoms worsen."

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Generate short lifestyle guidance for a patient diagnosed with {diagnosis}. Include diet advice, activity advice, and monitoring tips. Limit response to 3-5 bullet points."
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] AI Guidance Generation failed: {e}")
        return f"• Follow standard care plan for {diagnosis}.\n• Keep active daily.\n• Consult your physician if symptoms worsen."
