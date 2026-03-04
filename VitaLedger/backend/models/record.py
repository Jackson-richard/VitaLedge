from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class Demographics(BaseModel):
    age: int
    gender: str
    height: Optional[float] = None
    weight: Optional[float] = None

class Billing(BaseModel):
    consultation: float
    tests: float

class RecordUpload(BaseModel):
    patient_id: str
    demographics: dict
    symptoms: str
    medications: List[str]
    billing: Billing
    progress_notes: str
    diagnosis: str
    followup_date: Optional[str] = None
