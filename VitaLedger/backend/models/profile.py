from pydantic import BaseModel, Field
from typing import Optional

class PatientProfile(BaseModel):
    abha_id: str
    name: str
    age: int
    gender: str
    address: str
    phone: str
    height: float
    weight: float
    symptoms: str
    visit_date: str
