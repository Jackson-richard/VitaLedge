import time

def generate_patient_guidance(diagnosis: str) -> str:
    """Generate rule-based patient guidance messages based on diagnosis."""
    diagnosis_lower = diagnosis.lower() if diagnosis else ""
    
    if "diabetes" in diagnosis_lower:
        return "Maintain low sugar diet, walk 30 minutes daily, monitor glucose regularly."
    elif "hypertension" in diagnosis_lower or "blood pressure" in diagnosis_lower:
        return "Reduce salt intake, exercise regularly, monitor blood pressure weekly."
    elif "asthma" in diagnosis_lower:
        return "Avoid triggers, keep your inhaler handy, and monitor peak flow."
    elif "cholesterol" in diagnosis_lower:
        return "Eat a heart-healthy diet, exercise regularly, and limit saturated fats."
    else:
        return "Stay hydrated, maintain a balanced diet, and get adequate rest."

def generate_followup_reminder(date: str) -> str:
    """Generate a reminder message for follow-up appointments."""
    return f"Reminder: Your follow-up appointment is scheduled on {date}"

def simulate_sms(message: str):
    """Log SMS message sent to patient."""
    print(f"\nSMS SENT TO PATIENT:\n{message}\n")
