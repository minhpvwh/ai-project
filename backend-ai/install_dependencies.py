#!/usr/bin/env python3
"""
Install Dependencies for AI Backend
===================================

Script to install required Python packages for AI processing.
"""

import subprocess
import sys

def install_package(package):
    """Install a Python package using pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Install all required dependencies."""
    print("📦 Installing AI Backend Dependencies...")
    print("=" * 50)
    
    packages = [
        "pymongo>=4.6.0",
        "anthropic>=0.7.0", 
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "python-multipart>=0.0.6"
    ]
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print("=" * 50)
    if success_count == len(packages):
        print("🎉 All dependencies installed successfully!")
        print("\nNext steps:")
        print("1. Set ANTHROPIC_API_KEY environment variable")
        print("2. Make sure MongoDB is running")
        print("3. Run: python run_ai_server.py")
    else:
        print(f"⚠️  {len(packages) - success_count} packages failed to install")
        print("Please check the errors above and try again")

if __name__ == "__main__":
    main()
