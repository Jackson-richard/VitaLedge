from fastapi import APIRouter, Depends, HTTPException
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from utils.audit import log_audit
from bson import ObjectId
import time

router = APIRouter(prefix="/consent", tags=["consent"], dependencies=[Depends(JWTBearer())])

@router.post("/request")
async def request_consent(data: dict, current_user: dict = Depends(RoleChecker(["doctor"]))):
    patient_abha = data.get("abha_id") or data.get("patient_abha")
    
    doctor_id = current_user["user_id"]
    
    doctor_profile = db.users.find_one({"_id": ObjectId(doctor_id)})
    doctor_name = doctor_profile.get("username", "Unknown Doctor") if doctor_profile else "Unknown Doctor"
    
    existing = db.consent_requests.find_one({"doctor_id": doctor_id, "patient_abha": patient_abha})
    if existing:
        if existing["status"] in ["pending", "approved"]:
            return {"message": "Consent request already exists", "status": existing["status"]}
        else:
            # If denied previously, update to pending rather than duplicating
            db.consent_requests.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": "pending", "created_at": time.time()}}
            )
            print("CONSENT REQUEST UPDATED:", patient_abha)
            log_audit(doctor_id, "request_consent", f"Re-requested consent from patient {patient_abha}")
            return {"status": "pending", "message": "Consent requested successfully", "consent_id": str(existing["_id"])}
    
    consent_doc = {
        "patient_abha": patient_abha,
        "doctor_id": doctor_id,
        "doctor_name": f"Dr. {doctor_name}" if not doctor_name.startswith("Dr.") else doctor_name,
        "status": "pending",
        "created_at": time.time()
    }
    result = db.consent_requests.insert_one(consent_doc)
    print("CONSENT REQUEST CREATED:", patient_abha)
    log_audit(doctor_id, "request_consent", f"Requested consent from patient {patient_abha}")
    return {"status": "pending", "message": "Consent requested successfully", "consent_id": str(result.inserted_id)}

@router.put("/{consent_id}/update")
async def update_consent(consent_id: str, data: dict, current_user: dict = Depends(RoleChecker(["patient"]))):
    status = data.get("status")
    if status not in ["approved", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    try:
        consent = db.consent_requests.find_one({"_id": ObjectId(consent_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid consent ID")
        
    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")
        
    # Security: Ensure the person updating it is the patient requested
    user = db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user or user.get("abha_id") != consent["patient_abha"]:
         raise HTTPException(status_code=403, detail="Not authorized to update this consent")
    
    db.consent_requests.update_one({"_id": ObjectId(consent_id)}, {"$set": {"status": status}})
    
    print("CONSENT STATUS UPDATED:", status)
    
    log_audit(current_user["user_id"], "update_consent", f"Updated consent {consent_id} to {status}")
    
    return {"message": f"Consent updated to {status}"}

@router.get("/requests/{abha_id}")
async def get_patient_requests(abha_id: str, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    consents = list(db.consent_requests.find({"patient_abha": abha_id}))
    res = []
    for c in consents:
        res.append({
            "doctor_name": c.get("doctor_name"),
            "status": c.get("status"),
            "request_id": str(c["_id"])
        })
    return res

@router.get("/status/{doctor_id}/{abha_id}")
async def get_consent_status(doctor_id: str, abha_id: str):
    # Retrieve the latest consent request for this doctor/patient combination
    consent = db.consent_requests.find_one({"doctor_id": doctor_id, "patient_abha": abha_id}, sort=[("created_at", -1)])
    if consent:
        return {"status": consent["status"]}
    return {"status": None}
