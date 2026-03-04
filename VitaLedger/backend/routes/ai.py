from fastapi import APIRouter, Depends
from security.auth_bearer import RoleChecker, JWTBearer
from ml.model import predict_risk
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"], dependencies=[Depends(JWTBearer())])

class VitalsInput(BaseModel):
    age: float
    bmi: float
    blood_pressure: float
    glucose_level: float

@router.post("/predict")
async def get_prediction(vitals: VitalsInput, current_user: dict = Depends(RoleChecker(["patient", "doctor"]))):
    result = predict_risk(vitals.age, vitals.bmi, vitals.blood_pressure, vitals.glucose_level)
    return result
