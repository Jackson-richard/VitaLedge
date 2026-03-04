from fastapi import APIRouter, Depends, HTTPException
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from utils.audit import log_audit
from bson import ObjectId

router = APIRouter(prefix="/consent", tags=["consent"], dependencies=[Depends(JWTBearer())])

@router.post("/request")
async def request_consent(data: dict, current_user: dict = Depends(RoleChecker(["doctor"]))):
    patient_abha = data.get("abha_id")
    patient = db.Users.find_one({"abha_id": patient_abha, "role": "patient"})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found with this ABHA ID")
    
    doctor_id = current_user["user_id"]
    patient_id = str(patient["_id"])
    
    existing = db.Consents.find_one({"doctor_id": doctor_id, "patient_id": patient_id})
    if existing:
        return {"message": "Consent request already exists", "status": existing["status"]}
    
    consent_doc = {
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "status": "pending"
    }
    result = db.Consents.insert_one(consent_doc)
    log_audit(doctor_id, "request_consent", f"Requested consent from patient {patient_id}")
    return {"message": "Consent requested successfully", "consent_id": str(result.inserted_id)}

@router.put("/{consent_id}/update")
async def update_consent(consent_id: str, data: dict, current_user: dict = Depends(RoleChecker(["patient"]))):
    status = data.get("status")
    if status not in ["approved", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    try:
        consent = db.Consents.find_one({"_id": ObjectId(consent_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid consent ID")
        
    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")
        
    if consent["patient_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this consent")
    
    db.Consents.update_one({"_id": ObjectId(consent_id)}, {"$set": {"status": status}})
    log_audit(current_user["user_id"], "update_consent", f"Updated consent {consent_id} to {status}")
    
    return {"message": f"Consent updated to {status}"}

@router.get("/my-requests")
async def get_my_requests(current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    user_id = current_user["user_id"]
    if current_user["role"] == "patient":
        consents = list(db.Consents.find({"patient_id": user_id}))
    else:
        consents = list(db.Consents.find({"doctor_id": user_id}))
        
    for c in consents:
        c["_id"] = str(c["_id"])
        if current_user["role"] == "patient":
            doc = db.Users.find_one({"_id": ObjectId(c["doctor_id"])})
            c["doctor_name"] = doc["username"] if doc else "Unknown"
        else:
            pat = db.Users.find_one({"_id": ObjectId(c["patient_id"])})
            c["patient_name"] = pat["username"] if pat else "Unknown"
    return consents
