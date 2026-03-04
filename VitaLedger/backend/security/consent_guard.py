from fastapi import HTTPException
from database import db

def check_consent(doctor_id: str, patient_id: str):
    consent = db.Consents.find_one({"doctor_id": doctor_id, "patient_id": patient_id})
    if not consent or consent.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Consent missing or denied for this patient")
