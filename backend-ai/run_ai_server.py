#!/usr/bin/env python3
"""
Run AI API Server
=================

Script to start the AI processing API server.
"""

import os
import sys
import uvicorn

def main():
    """Start the AI API server."""
    print("🤖 Starting AI Document Processing API Server...")
    print("=" * 60)
    
    # Check if ANTHROPIC_API_KEY is set
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("❌ Error: ANTHROPIC_API_KEY environment variable is not set")
        print("Please set it with: export ANTHROPIC_API_KEY='your_api_key_here'")
        sys.exit(1)
    
    print("✓ Environment variables configured")
    print("✓ Starting server on http://localhost:8001")
    print("✓ API Documentation: http://localhost:8001/docs")
    print("=" * 60)
    
    try:
        uvicorn.run(
            "ai_controller:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 AI API Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
