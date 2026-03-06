import requests

base_url = "http://127.0.0.1:8000/auth"

print("Registering new test user...")
reg_payload = {
    "username": "tester123",
    "password": "mypassword1",
    "role": "patient"
}
r1 = requests.post(f"{base_url}/register", json=reg_payload)
print("Registration response:", r1.status_code, r1.text)

print("Logging in...")
log_payload = {
    "username": "tester123",
    "password": "mypassword1"
}
r2 = requests.post(f"{base_url}/login", json=log_payload)
print("Login response:", r2.status_code, r2.text)
