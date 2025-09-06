#!/usr/bin/env python3
"""
Demo script for Document Management System with AI Integration.
This script demonstrates the key features without requiring user interaction.
"""

import os
import tempfile
from document_manager import DocumentManager


def create_sample_pdf_content():
    """Create sample content that would be in a PDF."""
    return """
    Artificial Intelligence and Machine Learning
    
    Introduction
    Artificial Intelligence (AI) and Machine Learning (ML) are rapidly evolving fields
    that are transforming industries and creating new opportunities for innovation.
    
    Key Concepts
    1. Machine Learning: A subset of AI that enables computers to learn from data
    2. Deep Learning: Neural networks with multiple layers for complex pattern recognition
    3. Natural Language Processing: Teaching computers to understand human language
    4. Computer Vision: Enabling machines to interpret visual information
    5. Reinforcement Learning: Learning through interaction with an environment
    
    Applications
    - Healthcare: Medical diagnosis and drug discovery
    - Finance: Fraud detection and algorithmic trading
    - Transportation: Autonomous vehicles and traffic optimization
    - Technology: Virtual assistants and recommendation systems
    - Manufacturing: Quality control and predictive maintenance
    
    Future Trends
    The future of AI and ML looks promising with advances in:
    - Quantum computing integration
    - Edge AI for real-time processing
    - Explainable AI for transparency
    - Federated learning for privacy
    - AI ethics and responsible development
    
    Conclusion
    AI and ML will continue to shape our world, offering both opportunities and challenges
    that require careful consideration and responsible development.
    """


def demo_without_ai():
    """Demo the system without AI features (when API key is not available)."""
    print("🤖 Demo Mode: AI Features Disabled")
    print("=" * 50)
    
    # Initialize document manager
    dm = DocumentManager()
    
    # Create sample content
    content = create_sample_pdf_content()
    
    print("📄 Creating a sample document...")
    print(f"Title: AI and Machine Learning Guide")
    print(f"Content length: {len(content)} characters")
    
    # Create document (will have empty summary and tags without AI)
    document = dm.create_new_document("AI and Machine Learning Guide", content)
    
    print(f"\n✅ Document created successfully!")
    print(f"Document ID: {document['_id']}")
    print(f"Title: {document['title']}")
    print(f"Summary: {document['summary'] or 'No summary (AI not available)'}")
    print(f"Tags: {', '.join(document['tags']) if document['tags'] else 'No tags (AI not available)'}")
    print(f"Created: {document['created_at']}")
    
    # Search for the document
    print(f"\n🔍 Searching for documents...")
    results = dm.search_documents("machine learning")
    print(f"Found {len(results)} documents matching 'machine learning'")
    
    for i, doc in enumerate(results, 1):
        print(f"{i}. {doc['title']} (ID: {doc['_id']})")
    
    dm.close()
    return document


def demo_with_ai():
    """Demo the system with AI features enabled."""
    print("🤖 Demo Mode: AI Features Enabled")
    print("=" * 50)
    
    # Check if API key is available
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("⚠️  ANTHROPIC_API_KEY not set. Running without AI features.")
        return demo_without_ai()
    
    # Initialize document manager
    dm = DocumentManager()
    
    # Create sample content
    content = create_sample_pdf_content()
    
    print("📄 Creating a sample document with AI processing...")
    print(f"Title: AI and Machine Learning Guide")
    print(f"Content length: {len(content)} characters")
    
    # Generate AI summary
    print("\n🧠 Generating AI summary...")
    summary = dm.generate_summary(content)
    print(f"Summary length: {len(summary)} characters")
    
    # Generate AI tags
    print("\n🏷️  Generating AI tags...")
    tags = dm.suggest_tags(content)
    print(f"Suggested tags: {', '.join(tags)}")
    
    # Create document
    document = dm.create_new_document("AI and Machine Learning Guide", content)
    
    print(f"\n✅ Document created successfully!")
    print(f"Document ID: {document['_id']}")
    print(f"Title: {document['title']}")
    print(f"Summary: {document['summary'][:200]}...")
    print(f"Tags: {', '.join(document['tags'])}")
    print(f"Created: {document['created_at']}")
    
    # Search for the document
    print(f"\n🔍 Searching for documents...")
    results = dm.search_documents("artificial intelligence")
    print(f"Found {len(results)} documents matching 'artificial intelligence'")
    
    for i, doc in enumerate(results, 1):
        print(f"{i}. {doc['title']} (ID: {doc['_id']})")
        print(f"   Tags: {', '.join(doc.get('tags', []))}")
    
    dm.close()
    return document


def demo_file_upload():
    """Demo file upload functionality."""
    print("\n📁 Demo: File Upload")
    print("=" * 30)
    
    # Create a temporary text file
    content = """
    Python Programming Tips
    
    1. Use list comprehensions for cleaner code
    2. Leverage the power of generators
    3. Follow PEP 8 style guidelines
    4. Use virtual environments
    5. Write comprehensive tests
    6. Document your code properly
    7. Use type hints for better code clarity
    8. Handle exceptions gracefully
    """
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(content)
        temp_file = f.name
    
    try:
        dm = DocumentManager()
        
        print(f"📄 Uploading file: {temp_file}")
        document = dm.upload_document(temp_file, "Python Programming Tips")
        
        print(f"✅ File uploaded successfully!")
        print(f"Document ID: {document['_id']}")
        print(f"File path: {document.get('file_path', 'N/A')}")
        print(f"Summary: {document['summary'][:100]}...")
        print(f"Tags: {', '.join(document['tags'])}")
        
        dm.close()
        
    except Exception as e:
        print(f"❌ Error uploading file: {e}")
    finally:
        # Clean up temp file
        os.unlink(temp_file)


def main():
    """Run the complete demo."""
    print("🚀 Document Management System Demo")
    print("=" * 50)
    
    # Check MongoDB connection
    try:
        dm = DocumentManager()
        dm.close()
        print("✅ MongoDB connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Please ensure MongoDB is running on mongodb://localhost:27017/")
        return
    
    # Run demos
    try:
        # Demo with AI (if available)
        demo_with_ai()
        
        # Demo file upload
        demo_file_upload()
        
        print("\n🎉 Demo completed successfully!")
        print("\nTo run the interactive application:")
        print("python document_manager.py")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")


if __name__ == "__main__":
    main()
