from database import db
from datetime import datetime

def log_audit(user_id: str, action: str, details: str = ""):
    log_entry = {
        "user_id": user_id,
        "action": action,
        "timestamp": datetime.utcnow(),
        "details": details
    }
    db.AuditLogs.insert_one(log_entry)
