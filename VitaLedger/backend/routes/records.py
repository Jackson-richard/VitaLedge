from fastapi import APIRouter, Depends, HTTPException
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from security.encryption import encrypt_data, hash_data, decrypt_data
from security.consent_guard import check_consent
from utils.audit import log_audit
from models.record import RecordUpload
from blockchain.chain import ledger
import json
import time
from utils.notifications import generate_followup_reminder, simulate_sms
from services.ai_guidance import generate_ai_guidance
from datetime import datetime, timedelta

router = APIRouter(prefix="/records", tags=["records"], dependencies=[Depends(JWTBearer())])

@router.post("/upload")
async def upload_record(record: RecordUpload, current_user: dict = Depends(RoleChecker(["doctor"]))):
    doctor_id = current_user["user_id"]
    patient_id = record.patient_id
    
    check_consent(doctor_id, patient_id)
    
    # Fetch Patient Profile for Auto-filling record
    patient_profile = db.patient_profiles.find_one({"abha_id": patient_id})
    if not patient_profile:
        # Fallback if profile not created yet
        demographics = {"age": 0, "gender": "Unknown", "height": 0, "weight": 0}
        symptoms = "Not provided"
    else:
        demographics = {
            "age": patient_profile.get("age", 0),
            "gender": patient_profile.get("gender", "Unknown"),
            "height": patient_profile.get("height", 0),
            "weight": patient_profile.get("weight", 0)
        }
        symptoms = patient_profile.get("symptoms", "Not provided")

    record_dict = record.model_dump()
    
    # Generate AI Guidance
    ai_guidance_text = generate_ai_guidance(record_dict["diagnosis"])
    
    # Calculate Follow-up Date if not provided or to override
    followup_date_str = record_dict.get("followup_date")
    if not followup_date_str:
        diag_lower = record_dict["diagnosis"].lower()
        rule_days = 7
        if "diabetes" in diag_lower:
            rule_days = 30
        elif "hypertension" in diag_lower:
            rule_days = 14
        elif "asthma" in diag_lower:
            rule_days = 21
            
        followup_date = datetime.now() + timedelta(days=rule_days)
        followup_date_str = followup_date.strftime("%Y-%m-%d")
    
    final_record_data = {
        "patient_abha": patient_id, 
        "doctor_id": doctor_id,
        "age": demographics.get("age", 0),
        "gender": demographics.get("gender", "Unknown"),
        "height_cm": demographics.get("height", 0),
        "weight_kg": demographics.get("weight", 0),
        "diagnosis": record_dict["diagnosis"],
        "medications": ", ".join(record_dict["medications"]) if isinstance(record_dict["medications"], list) else record_dict["medications"],
        "clinical_notes": record_dict["progress_notes"],
        "consult_fee": record_dict["billing"]["consultation"],
        "test_cost": record_dict["billing"]["tests"],
        "followup_date": followup_date_str,
        "ai_guidance": ai_guidance_text, 
        "created_at": time.time()
    }
    
    data_str = json.dumps(final_record_data)
    encrypted_data = encrypt_data(data_str)
    record_hash = hash_data(encrypted_data)
    
    record_doc = {**final_record_data, "blockchain_hash": record_hash, "encrypted_data": encrypted_data}
    
    result = db.records.insert_one(record_doc)
    
    # Generate Notifications
    combined_msg = f"Your doctor recorded a diagnosis of {record_dict['diagnosis']}. Lifestyle guidance: {ai_guidance_text}"
    if followup_date_str:
        combined_msg += f" Next follow-up: {followup_date_str}."
        
    simulate_sms(combined_msg)
    
    db.patient_notifications.insert_one({
        "patient_abha": patient_id,
        "message": combined_msg,
        "type": "lifestyle_advice",
        "created_at": time.time()
    })
    
    ledger.add_block(record_hash, doctor_id)
    log_audit(doctor_id, "upload_record", f"Uploaded structured record for patient {patient_id}")
    return {"message": "Record uploaded securely", "record_id": str(result.inserted_id)}

@router.get("/patient/{patient_id}")
async def get_records(patient_id: str, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "doctor":
        check_consent(user_id, patient_id)
    elif role == "patient" and user_id != patient_id:
        raise HTTPException(status_code=403, detail="Cannot access other patient's records")
        
        
    records = list(db.records.find({"patient_abha": patient_id}))
    decrypted_records = []
    
    for r in records:
        try:
            current_hash = hash_data(r["encrypted_data"])
            integrity = "valid" if current_hash == r["blockchain_hash"] else "tampered"
            
            # Since data is stored unencrypted in new schema, we can return it directly.
            # But we maintain the structure expected by frontend (data node)
            decrypted_records.append({
                "record_id": str(r["_id"]),
                "doctor_id": r["doctor_id"],
                "timestamp": r["created_at"],
                "data": {
                    "diagnosis": r.get("diagnosis"),
                    "clinical_notes": r.get("clinical_notes"),
                    "demographics": {
                        "age": r.get("age"),
                        "gender": r.get("gender"),
                        "height": r.get("height_cm"),
                        "weight": r.get("weight_kg")
                    },
                    "medications": r.get("medications").split(', ') if r.get("medications") else [],
                    "billing": {
                        "consultation": r.get("consult_fee"),
                        "tests": r.get("test_cost")
                    },
                    "followup_date": r.get("followup_date"),
                    "ai_guidance": r.get("ai_guidance")
                },
                "integrity": integrity,
                "blockchain_hash": r.get("blockchain_hash")
            })
        except Exception as e:
            continue
            
    log_audit(user_id, "view_records", f"Viewed records for patient {patient_id}")
    return decrypted_records

@router.get("/doctor/{doctor_id}")
async def get_doctor_records(doctor_id: str, current_user: dict = Depends(RoleChecker(["doctor"]))):
    user_id = current_user["user_id"]
    
    if user_id != doctor_id:
        raise HTTPException(status_code=403, detail="Cannot access other doctor's records")
        
    records = list(db.records.find({"doctor_id": doctor_id}))
    decrypted_records = []
    
    for r in records:
        try:
            patient_id = r.get("patient_abha")
            consent = db.Consents.find_one({"doctor_id": doctor_id, "patient_id": patient_id})
            if not consent or consent.get("status") != "approved":
                continue 
                
            current_hash = hash_data(r["encrypted_data"])
            integrity = "valid" if current_hash == r["blockchain_hash"] else "tampered"
            
            decrypted_records.append({
                "record_id": str(r["_id"]),
                "patient_id": patient_id,
                "timestamp": r["created_at"],
                "data": {
                    "diagnosis": r.get("diagnosis"),
                    "clinical_notes": r.get("clinical_notes"),
                    "demographics": {
                        "age": r.get("age"),
                        "gender": r.get("gender"),
                        "height": r.get("height_cm"),
                        "weight": r.get("weight_kg")
                    },
                    "medications": r.get("medications").split(', ') if r.get("medications") else [],
                    "billing": {
                        "consultation": r.get("consult_fee"),
                        "tests": r.get("test_cost")
                    },
                    "followup_date": r.get("followup_date"),
                    "ai_guidance": r.get("ai_guidance")
                },
                "integrity": integrity,
                "blockchain_hash": r.get("blockchain_hash")
            })
        except Exception as e:
            print(f"[DEBUG Retrieval] Error decoding record: {e}")
            continue
            
    log_audit(user_id, "view_records", f"Viewed all records for doctor {doctor_id}")
    return decrypted_records

from bson import ObjectId

@router.get("/{record_id}/export")
async def export_record(record_id: str, current_user: dict = Depends(RoleChecker(["patient", "doctor", "admin"]))):
    try:
        record = db.Records.find_one({"_id": ObjectId(record_id)})
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
            
        data_str = decrypt_data(record["encrypted_data"])
        data_json = json.loads(data_str)
        
        export_data = {
            "patient_id": record["patient_id"],
            "doctor_id": record["doctor_id"],
            "timestamp": record["timestamp"],
            "data": data_json
        }
        log_audit(current_user["user_id"], "export_record", f"Exported record {record_id}")
        return export_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.post("/import")
async def import_record(data: dict, current_user: dict = Depends(RoleChecker(["doctor"]))):
    doctor_id = current_user["user_id"]
    patient_id = data.get("patient_id")
    
    check_consent(doctor_id, patient_id)
    
    record_data = data.get("data", {})
    data_str = json.dumps(record_data)
    encrypted_data = encrypt_data(data_str)
    record_hash = hash_data(encrypted_data)
    
    record_doc = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "encrypted_data": encrypted_data,
        "record_hash": record_hash,
        "timestamp": data.get("timestamp", time.time())
    }
    result = db.Records.insert_one(record_doc)
    
    ledger.add_block(record_hash, doctor_id)
    log_audit(doctor_id, "import_record", f"Imported record for patient {patient_id}")
    return {"message": "Record imported successfully", "record_id": str(result.inserted_id)}
