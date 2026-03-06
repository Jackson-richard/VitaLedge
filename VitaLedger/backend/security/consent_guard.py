from fastapi import HTTPException
from database import db

def check_consent(doctor_id: str, patient_id: str):
    
    consent = db.consent_requests.find_one({"doctor_id": doctor_id, "patient_abha": patient_id}, sort=[("created_at", -1)])
    if not consent or consent.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Patient consent required before accessing clinical records.")

    print("DOCTOR ACCESS VERIFIED:", doctor_id)
