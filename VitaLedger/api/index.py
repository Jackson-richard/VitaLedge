import sys
import os

# Make sure the backend directory is on the path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app  # noqa: F401 – Vercel picks up the `app` ASGI object
