from fastapi import APIRouter, HTTPException, Depends
from models.user import UserRegistration, UserLogin, Token
from database import db
from security.jwt_handler import signJWT
import bcrypt
from utils.audit import log_audit

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

from utils.abha import generate_abha_id

@router.post("/register", response_model=Token)
async def register(user: UserRegistration):
    if db.Users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pwd = hash_password(user.password)
    
    abha = user.abha_id
    if user.role == "patient" and not abha:
        abha = generate_abha_id()
        
    user_dict = {
        "username": user.username,
        "password_hash": hashed_pwd,
        "role": user.role,
        "abha_id": abha
    }
    result = db.Users.insert_one(user_dict)
    
    log_audit(str(result.inserted_id), "register", f"Registered new {user.role}")
    
    token = signJWT(str(result.inserted_id), user.role)
    return {"access_token": token, "token_type": "bearer", "role": user.role}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = db.Users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    log_audit(str(db_user["_id"]), "login", "User logged in")
    
    token = signJWT(str(db_user["_id"]), db_user["role"])
    return {"access_token": token, "token_type": "bearer", "role": db_user["role"]}
