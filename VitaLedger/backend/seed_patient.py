from database import db
import time

patient_data = {
  "abha_id": "ABHA-7503-6507",
  "name": "Renita",
  "age": 15,
  "gender": "Female",
  "address": "No2 Gandhi Nagar Medavakkam",
  "phone": "8056593516",
  "height": 156,
  "weight": 70,
  "current_symptoms": "headache",
  "created_at": time.time()
}

db.patients.update_one({"abha_id": patient_data["abha_id"]}, {"$set": patient_data}, upsert=True)
print("Patient inserted successfully.")
