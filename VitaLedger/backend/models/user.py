from pydantic import BaseModel
from typing import Optional

class UserRegistration(BaseModel):
    username: str
    password: str
    role: str # "patient", "doctor", "admin"
    abha_id: Optional[str] = None # Mainly for patient

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
