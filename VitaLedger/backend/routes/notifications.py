from fastapi import APIRouter, Depends
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from bson import ObjectId

router = APIRouter(prefix="/notifications", tags=["notifications"], dependencies=[Depends(JWTBearer())])

@router.get("/patient/{patient_abha}")
async def get_patient_notifications(patient_abha: str, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    # Depending on auth handling, you might want to check if the user is fetching their own stuff.
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "patient":
        user_doc = db.users.find_one({"_id": ObjectId(user_id)})
        user_abha = user_doc.get("abha_id") if user_doc else None
        if user_abha != patient_abha:
            return []
        
    notifications = list(db.patient_notifications.find({"patient_abha": patient_abha}).sort("created_at", -1))
    
    # Strip object ID for JSON response map
    return [
        {
            "id": str(n["_id"]),
            "patient_abha": n["patient_abha"],
            "message": n["message"],
            "type": n["type"],
            "created_at": n["created_at"]
        } for n in notifications
    ]
