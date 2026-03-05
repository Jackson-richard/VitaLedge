import requests

URL = "http://localhost:8000/auth/register"

patient = {
    "username": "test_patient",
    "password": "password",
    "role": "patient",
    "abha_id": "ABHA-7503-6507"
}

doctor = {
    "username": "test_doctor",
    "password": "password",
    "role": "doctor"
}

p_res = requests.post(URL, json=patient)
print("Patient:", p_res.json())

d_res = requests.post(URL, json=doctor)
print("Doctor:", d_res.json())
