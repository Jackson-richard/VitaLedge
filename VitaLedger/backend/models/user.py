from pydantic import BaseModel
from typing import Optional

class UserRegistration(BaseModel):
    username: str
    password: str
    role: str 
    abha_id: Optional[str] = None 

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: Optional[str] = None
    abha_id: Optional[str] = None
