import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

load_model()

def predict_risk(age: float, bmi: float, bp: float, glucose: float) -> dict:
    if not model:
        # Load it if the route is hit before it's loaded due to missing file initially
        load_model()
        if not model:
            return {"error": "Model not loaded"}
    
    features = [[age, bmi, bp, glucose]]
    prob = model.predict_proba(features)[0][1] * 100
    
    if prob >= 70:
        rec = "High risk detected. Immediate medical consultation recommended."
    elif prob >= 40:
        rec = "Moderate risk. Monitor vitals and consult a doctor."
    else:
        rec = "Low risk. Maintain a healthy lifestyle."
        
    return {
        "risk_score_percentage": round(prob, 2),
        "recommendation": rec
    }
