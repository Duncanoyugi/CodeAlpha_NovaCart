#!/usr/bin/env python
"""
Test script to verify Neon PostgreSQL connection
Run: python test_db_connection.py
"""

import os
import sys
import django
from django.db import connection
from django.db.utils import OperationalError

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
os.environ.setdefault('DJANGO_ENV', 'development')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_connection():
    """Test the database connection"""
    print("\n" + "="*60)
    print("🔍 TESTING NEON POSTGRESQL CONNECTION")
    print("="*60 + "\n")
    
    try:
        # Initialize Django
        django.setup()
        
        # Test the connection
        with connection.cursor() as cursor:
            # Check PostgreSQL version
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Connected to PostgreSQL")
            print(f"   Version: {version[0][:60]}...")
            
            # Check current database
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()
            print(f"   Database: {db_name[0]}")
            
            # Check current user
            cursor.execute("SELECT current_user;")
            user = cursor.fetchone()
            print(f"   User: {user[0]}")
            
            # Check connection settings
            cursor.execute("SHOW ssl;")
            ssl_status = cursor.fetchone()
            print(f"   SSL: {ssl_status[0]}")
            
        print("\n✅ Database connection successful!")
        return True
        
    except OperationalError as e:
        print(f"\n❌ Database connection failed!")
        print(f"   Error: {str(e)}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return False

def test_migrations():
    """Check migration status"""
    print("\n" + "="*60)
    print("📊 CHECKING MIGRATION STATUS")
    print("="*60 + "\n")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        out = StringIO()
        call_command('showmigrations', stdout=out)
        print(out.getvalue())
        
        print("\n✅ Migration check completed")
        return True
    except Exception as e:
        print(f"❌ Migration check failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Neon PostgreSQL tests...\n")
    
    # Test connection
    if test_connection():
        print("\n" + "="*60)
        print("✨ NEON POSTGRESQL IS READY FOR DEVELOPMENT!")
        print("="*60)
        
        # Test migrations
        test_migrations()
        
        print("\n📝 Next steps:")
        print("   1. Run: python manage.py makemigrations")
        print("   2. Run: python manage.py migrate")
        print("   3. Run: python manage.py createsuperuser")
        print("   4. Run: python manage.py runserver")
    else:
        print("\n❌ Please check your database configuration in .env file")
        sys.exit(1)