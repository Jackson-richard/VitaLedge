import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.database import db
from backend.routes.auth import hash_password
from backend.utils.abha import generate_abha_id
from backend.security.encryption import encrypt_data, hash_data
from backend.blockchain.chain import ledger
import json
import time

def seed_data():
    print("Clearing database...")
    db.Users.delete_many({})
    db.Consents.delete_many({})
    db.Records.delete_many({})
    db.AuditLogs.delete_many({})

    print("Seeding Users...")
    abha = generate_abha_id()
    patient = {
        "username": "patient1",
        "password_hash": hash_password("pass123"),
        "role": "patient",
        "abha_id": abha
    }
    pat_id = db.Users.insert_one(patient).inserted_id

    doctor = {
        "username": "doctor1",
        "password_hash": hash_password("pass123"),
        "role": "doctor",
        "abha_id": None
    }
    doc_id = db.Users.insert_one(doctor).inserted_id

    admin = {
        "username": "admin1",
        "password_hash": hash_password("pass123"),
        "role": "admin",
        "abha_id": None
    }
    db.Users.insert_one(admin)

    print("Seeding Consent...")
    consent = {
        "doctor_id": str(doc_id),
        "patient_id": str(pat_id),
        "status": "approved"
    }
    db.Consents.insert_one(consent)

    print("Seeding Sample Record...")
    sample_data = {
        "diagnosis": "Type 2 Diabetes preliminary signs.",
        "prescription": "Metformin 500mg daily. Monitor Glucose."
    }
    data_str = json.dumps(sample_data)
    encrypted_data = encrypt_data(data_str)
    record_hash = hash_data(encrypted_data)
    
    record = {
        "patient_id": str(pat_id),
        "doctor_id": str(doc_id),
        "encrypted_data": encrypted_data,
        "record_hash": record_hash,
        "timestamp": time.time()
    }
    db.Records.insert_one(record)
    ledger.add_block(record_hash, str(doc_id))

    print("Seeding completed successfully!")
    print(f"Patient ABHA ID: {abha}")
    print("Accounts: patient1 / pass123 | doctor1 / pass123 | admin1 / pass123")

if __name__ == "__main__":
    seed_data()
