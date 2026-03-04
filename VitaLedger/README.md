# VitaLedger — ABDM-Aligned Secure EHR System

VitaLedger is a modular, secure Electronic Health Record system aligned with ABDM standards. It demonstrates how a lightweight blockchain ledger acts as a verification layer for encrypted healthcare data in MongoDB.

## Features
- Role-based Access (Patient, Doctor, Admin)
- Simulated ABHA ID generation
- Fernet Encryption for medical records
- Lightweight Blockchain Verification Layer
- Scikit-learn AI Health Risk Prediction
- React + Tailwind Frontend Dashboard
- Tamper Test Demo
- JSON Interoperability (Import/Export endpoints)

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB (Running on `localhost:27017` or update MONGO_URI in `backend/.env`)

## 1. Setup Backend

```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install fastapi uvicorn pymongo cryptography scikit-learn python-dotenv pyjwt passlib bcrypt

# Generate the .env file locally if .env.example needs mapping
# (Note: the app handles missing keys gracefully by generating a Fernet key to a new .env automatically)

# Train the AI Model first
python ml/train.py
```

## 2. Setup Frontend

```bash
cd frontend
npm install
```

## 3. Seed Sample Data
A seed script is provided to populate test users (patient1, doctor1, admin1) and records.

```bash
# In the root project directory (with backend venv active):
python seed.py
```

## 4. Run the Application

**Run Backend:**
```bash
cd backend
# With venv activated
uvicorn main:app --reload --port 8000
```

**Run Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to view the dashboards!

## Demo Mode
Login as `admin1` / `pass123`.
- Click "Verify Integrity" — it should show valid.
- Click "Tamper Demo" — it manipulates a DB record.
- Click "Verify Integrity" again — it detects the discrepancy and highlights the broken hash chain.
