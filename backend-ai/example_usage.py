#!/usr/bin/env python3
"""
Example usage of DocumentManager with AI integration
"""

import os
from document_manager import DocumentManager

def example_basic_usage():
    """Basic usage example."""
    print("📚 Basic DocumentManager Usage Example")
    print("=" * 50)
    
    # Initialize document manager
    dm = DocumentManager()
    
    # Example 1: Process text content
    content = """
    Artificial Intelligence (AI) is transforming the way we work and live. 
    From machine learning algorithms to natural language processing, AI technologies 
    are being integrated into various industries including healthcare, finance, 
    education, and transportation. The future of AI holds great promise for 
    solving complex problems and improving human productivity.
    """
    
    print("🤖 Processing document with AI...")
    doc_id = dm.process_document(content, "AI Overview")
    print(f"✅ Document processed: {doc_id}")
    
    # Display results
    dm.display_document_summary(doc_id)
    
    dm.close()

def example_vietnamese_processing():
    """Vietnamese language processing example."""
    print("\n🇻🇳 Vietnamese Language Processing Example")
    print("=" * 50)
    
    dm = DocumentManager()
    
    vietnamese_content = """
    Trí tuệ nhân tạo (AI) đang thay đổi cách chúng ta làm việc và sống. 
    Từ các thuật toán học máy đến xử lý ngôn ngữ tự nhiên, các công nghệ AI 
    đang được tích hợp vào nhiều ngành công nghiệp bao gồm y tế, tài chính, 
    giáo dục và giao thông vận tải. Tương lai của AI hứa hẹn giải quyết 
    những vấn đề phức tạp và cải thiện năng suất của con người.
    """
    
    print("🤖 Xử lý tài liệu tiếng Việt với AI...")
    doc_id = dm.process_document(vietnamese_content, "Tổng quan về AI")
    print(f"✅ Tài liệu đã được xử lý: {doc_id}")
    
    # Display results
    dm.display_document_summary(doc_id)
    
    dm.close()

def example_file_processing():
    """File processing example."""
    print("\n📁 File Processing Example")
    print("=" * 50)
    
    # Create a sample text file
    sample_content = """
    Machine Learning Fundamentals
    
    Machine learning is a subset of artificial intelligence that focuses on 
    algorithms that can learn from data. There are three main types of machine learning:
    
    1. Supervised Learning: Learning with labeled training data
    2. Unsupervised Learning: Finding patterns in unlabeled data
    3. Reinforcement Learning: Learning through interaction with environment
    
    Popular machine learning algorithms include linear regression, decision trees, 
    neural networks, and support vector machines.
    """
    
    with open("sample_document.txt", "w", encoding="utf-8") as f:
        f.write(sample_content)
    
    print("✅ Created sample_document.txt")
    
    try:
        dm = DocumentManager()
        
        # Process the file
        document = dm.upload_document("sample_document.txt", "Machine Learning Guide")
        print(f"✅ File processed: {document['_id']}")
        
        # Display results
        dm.display_document_summary(document['_id'])
        
        dm.close()
        
    finally:
        # Clean up
        if os.path.exists("sample_document.txt"):
            os.remove("sample_document.txt")
            print("✅ Cleaned up sample file")

def example_search_functionality():
    """Search functionality example."""
    print("\n🔍 Search Functionality Example")
    print("=" * 50)
    
    dm = DocumentManager()
    
    # Search for documents
    print("Searching for documents containing 'AI'...")
    documents = dm.search_documents("AI")
    
    print(f"Found {len(documents)} documents:")
    for doc in documents:
        print(f"- {doc['title']} (ID: {doc['_id']})")
        print(f"  Tags: {', '.join(doc.get('tags', []))}")
        print(f"  Language: {doc.get('language', 'unknown')}")
        print()
    
    # Search by tags
    print("Searching for documents with 'machine learning' tag...")
    documents = dm.search_documents(tags=["machine learning"])
    
    print(f"Found {len(documents)} documents with 'machine learning' tag")
    
    dm.close()

def main():
    """Run all examples."""
    print("🚀 DocumentManager AI Integration Examples")
    print("=" * 60)
    
    # Check if API key is available
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("⚠️  ANTHROPIC_API_KEY not set. AI features will not work.")
        print("Please set your API key: export ANTHROPIC_API_KEY='your_key_here'")
        return
    
    try:
        # Run examples
        example_basic_usage()
        example_vietnamese_processing()
        example_file_processing()
        example_search_functionality()
        
        print("\n🎉 All examples completed successfully!")
        
    except Exception as e:
        print(f"❌ Example failed: {e}")

if __name__ == "__main__":
    main()