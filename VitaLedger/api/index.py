import sys
import os

backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(backend_path))

from main import app

# The frontend calls /api/auth/login → Vercel strips /api → FastAPI sees /auth/login
handler = app
