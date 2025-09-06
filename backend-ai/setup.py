#!/usr/bin/env python3
"""
Setup script for Document Management System with AI Integration.
"""

import os
import sys
import subprocess
import platform


def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required.")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True


def install_requirements():
    """Install required packages."""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False


def check_mongodb():
    """Check if MongoDB is available."""
    print("🔍 Checking MongoDB connection...")
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        client.server_info()
        print("✅ MongoDB is running and accessible!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Please ensure MongoDB is running on mongodb://localhost:27017/")
        return False


def check_anthropic_key():
    """Check if Anthropic API key is set."""
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if api_key:
        print("✅ Anthropic API key is set!")
        return True
    else:
        print("⚠️  Anthropic API key not found in environment variables.")
        print("Set ANTHROPIC_API_KEY to enable AI features.")
        return False


def create_env_file():
    """Create .env file from template."""
    if not os.path.exists('.env'):
        if os.path.exists('env_example.txt'):
            with open('env_example.txt', 'r') as f:
                content = f.read()
            with open('.env', 'w') as f:
                f.write(content)
            print("✅ Created .env file from template.")
            print("Please edit .env and add your Anthropic API key.")
        else:
            print("⚠️  env_example.txt not found. Please create .env manually.")
    else:
        print("✅ .env file already exists.")


def run_tests():
    """Run test suite."""
    print("🧪 Running tests...")
    try:
        result = subprocess.run([sys.executable, "test_document_manager.py"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ All tests passed!")
            return True
        else:
            print("❌ Some tests failed:")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Failed to run tests: {e}")
        return False


def main():
    """Main setup function."""
    print("🚀 Document Management System Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    # Check MongoDB
    mongodb_ok = check_mongodb()
    
    # Check Anthropic API key
    anthropic_ok = check_anthropic_key()
    
    # Run tests
    tests_ok = run_tests()
    
    print("\n" + "=" * 40)
    print("📋 Setup Summary:")
    print(f"Python: ✅")
    print(f"Requirements: ✅")
    print(f"MongoDB: {'✅' if mongodb_ok else '❌'}")
    print(f"Anthropic API: {'✅' if anthropic_ok else '⚠️'}")
    print(f"Tests: {'✅' if tests_ok else '❌'}")
    
    if mongodb_ok and anthropic_ok:
        print("\n🎉 Setup completed successfully!")
        print("You can now run: python document_manager.py")
    else:
        print("\n⚠️  Setup completed with warnings.")
        if not mongodb_ok:
            print("- Please start MongoDB")
        if not anthropic_ok:
            print("- Please set ANTHROPIC_API_KEY environment variable")


if __name__ == "__main__":
    main()
