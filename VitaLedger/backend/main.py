from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VitaLedger", description="ABDM-Aligned Secure EHR System with Blockchain Verification")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "VitaLedger Backend is running"}

from routes import auth, consent, records, ai, admin, notifications, profile, patients
app.include_router(auth.router)
app.include_router(consent.router)
app.include_router(records.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(profile.router)
app.include_router(patients.router)
