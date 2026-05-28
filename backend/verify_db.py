# backend/verify_db.py
import os
import django
from django.db import connection

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
os.environ.setdefault('DJANGO_ENV', 'development')
django.setup()

def verify_database():
    print("🔍 Verifying PostgreSQL Connection...")
    
    # Check connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connected to: {version[0][:50]}...")
        
        # List all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"\n📊 Found {len(tables)} tables in database:")
        for table in tables[:10]:  # Show first 10 tables
            print(f"   - {table[0]}")
        
    print("\n✅ PostgreSQL is working perfectly with Django!")

if __name__ == "__main__":
    verify_database()