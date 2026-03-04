# VitaLedger – Blockchain Secured Electronic Health Record System

VitaLedger is a prototype **Electronic Health Record (EHR) platform** designed to demonstrate how **blockchain integrity verification, AI-assisted health risk analysis, and secure consent-based access control** can be integrated into healthcare systems.

The platform allows doctors to securely store patient medical records, patients to control who can access their data, and administrators to verify that medical records have not been tampered with.

The system also introduces automated patient-care notifications such as lifestyle guidance and follow-up reminders.

---

# Problem

Healthcare data today faces several challenges:

• Medical records can be altered without detection
• Patients often have little control over who accesses their data
• Hospitals store data in fragmented systems
• Follow-up reminders and patient education are inconsistent
• Trust between healthcare providers and patients is often limited by lack of transparency

These problems can lead to **medical errors, privacy concerns, and reduced patient engagement**.

---

# Solution

VitaLedger demonstrates a secure healthcare data system that combines:

• **Blockchain integrity verification** to detect record tampering
• **Consent-based doctor access management**
• **AI-based health risk prediction** from patient vitals
• **Structured electronic medical records**
• **Automated patient lifestyle and follow-up reminders**

The system ensures that healthcare data remains **transparent, secure, and verifiable**.

---

# Key Features

## Secure Electronic Health Records

Doctors can create structured medical records including:

• Demographic details
• Past medical history
• Current medications
• Billing information
• Progress notes and diagnosis
• Follow-up appointment dates

All records are securely stored in **MongoDB**.

---

## Blockchain Integrity Verification

Each medical record is hashed using cryptographic algorithms.

The hash is stored in a blockchain-style ledger to ensure that:

• Any modification to the record is detected
• The integrity of the medical history is preserved
• Administrators can verify record authenticity

If tampering occurs, the system flags an **Integrity Violation**.

---

## Consent-Based Doctor Access

Patients control which doctors can access their medical records.

Workflow:

Doctor requests access →
Patient approves or denies →
Doctor receives encrypted access to records.

This simulates **patient-controlled medical data sovereignty**.

---

## AI Health Risk Analysis

The system includes an AI diagnostic module that evaluates health risks based on vital parameters such as:

• Age
• BMI
• Blood pressure
• Glucose levels

The model produces a **risk assessment score** to assist early screening.

---

## Automated Patient Care Notifications

When a doctor records a diagnosis, the system generates automated patient guidance.

Example:

Diagnosis: Diabetes

Patient receives guidance:

• Maintain a low sugar diet
• Walk at least 30 minutes daily
• Monitor blood glucose regularly

The system also generates **follow-up reminders** for upcoming appointments.

For hackathon purposes, SMS delivery is simulated using:

• console logs
• dashboard notifications

---

# System Roles

The platform contains three primary user roles.

### Patient

Patients can:

• View their health records
• Approve or deny doctor access requests
• Receive medical guidance notifications
• Monitor health risk predictions

---

### Doctor

Doctors can:

• Request patient data access
• Create and update medical records
• Add prescriptions and clinical notes
• Store records securely on the blockchain ledger

---

### Admin

Administrators can:

• Verify blockchain integrity
• Detect tampered records
• Monitor system activity logs
• simulate database tampering for testing

---

# Technology Stack

Frontend
React
Vite
JavaScript
Tailwind / Modern UI Components

Backend
Node.js
Express.js

Database
MongoDB

Security & Verification
Blockchain-style ledger hashing
SHA256 cryptographic verification

AI Module
Scikit-learn logistic regression (risk prediction)

---

# System Architecture

Doctor enters medical record
↓
Record stored in MongoDB
↓
Cryptographic hash generated
↓
Hash stored in blockchain ledger
↓
AI analyzes health risk
↓
System generates patient guidance notifications

This architecture ensures **data integrity, transparency, and patient engagement**.

---

# Project Structure

frontend/
components/
pages/
dashboard modules

backend/
routes/
controllers/
blockchain verification

database/
MongoDB collections for users, records, notifications

---

# Demo Features

The project demonstrates several healthcare security scenarios:

• Secure medical record storage
• Doctor access approval by patients
• Blockchain verification of record integrity
• Tamper detection simulation
• AI health risk scoring
• Automated care guidance notifications

---

# Future Improvements

Potential extensions include:

• Integration with real SMS APIs (Twilio / AWS SNS)
• Hospital system interoperability (FHIR standards)
• Real blockchain networks (Ethereum / Hyperledger)
• Machine learning disease prediction models
• Patient mobile application integration

---

# Purpose

VitaLedger was developed as a **hackathon prototype** to explore how emerging technologies such as blockchain and AI can strengthen healthcare data security and patient engagement.

The goal is to demonstrate a system where **medical data remains trustworthy, transparent, and patient-controlled**.

---

# License

This project is developed for educational and research purposes.
