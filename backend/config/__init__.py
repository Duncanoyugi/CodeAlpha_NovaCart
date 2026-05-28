# backend/config/__init__.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file in backend directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Determine which settings to use based on environment
environment = os.getenv('DJANGO_ENV', 'development')

print(f"\n🚀 NovaCart Starting...")
print(f"📁 Environment: {environment.upper()}")
print(f"🐘 Database: Neon PostgreSQL")

# Django loads settings via DJANGO_SETTINGS_MODULE, so do not import environment-based
# settings here (it breaks imports like config.settings.development).

