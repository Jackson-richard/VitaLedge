from fastapi import APIRouter, Depends, HTTPException
from database import db
from security.auth_bearer import RoleChecker, JWTBearer
from blockchain.chain import ledger
from security.encryption import hash_data
from utils.audit import log_audit
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(JWTBearer())])

@router.get("/verify-chain")
async def verify_chain(current_user: dict = Depends(RoleChecker(["admin"]))):
    records = list(db.medical_records.find().sort("created_at", 1))
    
    for i in range(1, len(ledger.chain)):
        current_block = ledger.chain[i]
        prev_block = ledger.chain[i - 1]
        
        if current_block.previous_hash != prev_block.block_hash:
            return {"status": "tampered", "block_index": current_block.index, "reason": "Chain linkage broken"}
            
        if current_block.block_hash != current_block.calculate_hash():
            return {"status": "tampered", "block_index": current_block.index, "reason": "Block hash mismatch"}
            
        record = db.medical_records.find_one({"blockchain_hash": current_block.record_hash})
        if not record:
            return {"status": "tampered", "block_index": current_block.index, "reason": "Record not found in database"}
            
        recalculated_hash = hash_data(record["encrypted_data"])
        if recalculated_hash != current_block.record_hash:
            return {"status": "tampered", "block_index": current_block.index, "reason": "Database record altered"}
            
    log_audit(current_user["user_id"], "verify_chain", "Verified blockchain integrity")
    return {"status": "valid"}

@router.post("/tamper-record")
async def tamper_record(data: dict, current_user: dict = Depends(RoleChecker(["admin"]))):
    record_id = data.get("record_id")
    new_data = data.get("new_data", "TAMPERED DATA - HACKATHON DEMO")
    
    if not record_id:
        record = db.medical_records.find_one()
        if not record:
            raise HTTPException(status_code=404, detail="No records to tamper")
        record_id = str(record["_id"])
    
    db.medical_records.update_one({"_id": ObjectId(record_id)}, {"$set": {"encrypted_data": new_data}})
    
    log_audit(current_user["user_id"], "tamper_record", f"Intentionally tampered record {record_id}")
    return {"message": "Record tampered successfully", "record_id": record_id}

@router.get("/audit-logs")
async def get_audit_logs(current_user: dict = Depends(RoleChecker(["admin"]))):
    logs = list(db.AuditLogs.find().sort("timestamp", -1).limit(100))
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs
