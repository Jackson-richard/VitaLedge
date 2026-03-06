from fastapi import APIRouter, Depends, HTTPException
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from models.profile import PatientProfile
from bson import ObjectId
import time

router = APIRouter(prefix="/profile", tags=["profile"], dependencies=[Depends(JWTBearer())])

@router.post("/patient")
async def update_patient_profile(profile: PatientProfile, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    
    if role == "patient":
        user_doc = db.users.find_one({"_id": ObjectId(user_id)})
        user_abha = user_doc.get("abha_id") if user_doc else None
        if user_abha != profile.abha_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this profile")
        
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = time.time()
    
    
    result = db.patients.update_one(
        {"abha_id": profile.abha_id},
        {"$set": profile_dict},
        upsert=True
    )
    
    return {"message": "Profile updated successfully"}

@router.get("/patient/{abha_id}")
async def get_patient_profile(abha_id: str, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "patient":
        user_doc = db.users.find_one({"_id": ObjectId(user_id)})
        user_abha = user_doc.get("abha_id") if user_doc else None
        if user_abha != abha_id:
            raise HTTPException(status_code=403, detail="Cannot access other patient's profile")
            
    profile = db.patients.find_one({"abha_id": abha_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return profile
