from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter(prefix="/api/patients", tags=["patients"])

@router.get("/{abha_id}")
async def get_patient_by_abha(abha_id: str):
    print(f"Patient lookup requested: {abha_id}")
    patient = db.patients.find_one({"abha_id": abha_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient Not Found")
    
    print("Patient found in MongoDB")
    return patient
