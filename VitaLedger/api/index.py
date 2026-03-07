import sys
import os

# Add backend/ to path so FastAPI routes and modules can be imported
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(backend_path))

from main import app

# Vercel routes /api/* to this file. FastAPI sees the full path including /api prefix,
# so we re-export app as-is. Vercel's python runtime calls app directly as ASGI.
# The frontend calls /api/auth/login → Vercel strips /api → FastAPI sees /auth/login
handler = app
