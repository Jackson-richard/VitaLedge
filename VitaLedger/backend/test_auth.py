import httpx
import json

base_url = "http://localhost:8000/auth"

print("--- Registering ---")
try:
    reg_res = httpx.post(f"{base_url}/register", json={
        "username": "testuser",
        "password": "testpassword",
        "role": "patient",
        "abha_id": "ABHA-1234-5678"
    })
    print("Status:", reg_res.status_code)
    print("Response:", reg_res.text)
except Exception as e:
    print("Error:", e)

print("\n--- Logging in ---")
try:
    login_res = httpx.post(f"{base_url}/login", json={
        "username": "testuser",
        "password": "testpassword"
    })
    print("Status:", login_res.status_code)
    print("Response:", login_res.text)
except Exception as e:
    print("Error:", e)
