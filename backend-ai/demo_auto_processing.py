#!/usr/bin/env python3
"""
Demo script for automatic AI processing
"""

import os
import time
from document_manager import DocumentManager

def demo_auto_processing():
    """Demo automatic AI processing functionality."""
    print("🤖 Demo: Automatic AI Processing")
    print("=" * 50)
    
    # Create sample documents
    sample_docs = [
        {
            "title": "AI Technology Overview",
            "content": """
            Artificial Intelligence (AI) is revolutionizing the way we work and live. 
            From machine learning algorithms to natural language processing, AI technologies 
            are being integrated into various industries including healthcare, finance, 
            education, and transportation. The future of AI holds great promise for 
            solving complex problems and improving human productivity.
            
            Key areas of AI development include:
            - Machine Learning and Deep Learning
            - Natural Language Processing
            - Computer Vision
            - Robotics and Automation
            - Expert Systems
            """
        },
        {
            "title": "Tổng quan về Trí tuệ Nhân tạo",
            "content": """
            Trí tuệ nhân tạo (AI) đang cách mạng hóa cách chúng ta làm việc và sống. 
            Từ các thuật toán học máy đến xử lý ngôn ngữ tự nhiên, các công nghệ AI 
            đang được tích hợp vào nhiều ngành công nghiệp bao gồm y tế, tài chính, 
            giáo dục và giao thông vận tải. Tương lai của AI hứa hẹn giải quyết 
            những vấn đề phức tạp và cải thiện năng suất của con người.
            
            Các lĩnh vực chính của AI bao gồm:
            - Học máy và Học sâu
            - Xử lý ngôn ngữ tự nhiên
            - Thị giác máy tính
            - Robot và Tự động hóa
            - Hệ thống chuyên gia
            """
        }
    ]
    
    try:
        dm = DocumentManager()
        print("✅ DocumentManager initialized")
        
        for i, doc in enumerate(sample_docs, 1):
            print(f"\n📄 Processing document {i}: {doc['title']}")
            print("-" * 40)
            
            # Auto-process document
            start_time = time.time()
            doc_id = dm.process_document(doc['content'], doc['title'])
            processing_time = time.time() - start_time
            
            print(f"⏱️  Processing time: {processing_time:.2f} seconds")
            print(f"🆔 Document ID: {doc_id}")
            
            # Display results
            dm.display_document_summary(doc_id)
            
            print("\n" + "="*50)
        
        # Search demo
        print("\n🔍 Search Demo:")
        print("-" * 20)
        
        # Search for AI-related documents
        ai_docs = dm.search_documents("AI")
        print(f"Found {len(ai_docs)} documents containing 'AI':")
        for doc in ai_docs:
            print(f"- {doc['title']} (Language: {doc.get('language', 'unknown')})")
        
        # Search for Vietnamese documents
        vi_docs = dm.search_documents("trí tuệ")
        print(f"\nFound {len(vi_docs)} Vietnamese documents:")
        for doc in vi_docs:
            print(f"- {doc['title']} (Language: {doc.get('language', 'unknown')})")
        
        dm.close()
        print("\n🎉 Demo completed successfully!")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")

def demo_file_processing():
    """Demo file processing with automatic AI."""
    print("\n📁 Demo: File Processing with Auto AI")
    print("=" * 50)
    
    # Create test files
    test_files = [
        {
            "filename": "ai_guide.txt",
            "content": """
            Machine Learning Guide
            
            Machine learning is a subset of artificial intelligence that focuses on 
            algorithms that can learn from data. There are three main types:
            
            1. Supervised Learning: Learning with labeled training data
            2. Unsupervised Learning: Finding patterns in unlabeled data  
            3. Reinforcement Learning: Learning through interaction with environment
            
            Popular algorithms include linear regression, decision trees, 
            neural networks, and support vector machines.
            """
        },
        {
            "filename": "huong_dan_hoc_may.txt", 
            "content": """
            Hướng dẫn Học Máy
            
            Học máy là một tập con của trí tuệ nhân tạo tập trung vào 
            các thuật toán có thể học từ dữ liệu. Có ba loại chính:
            
            1. Học có giám sát: Học với dữ liệu huấn luyện có nhãn
            2. Học không giám sát: Tìm kiếm mẫu trong dữ liệu không có nhãn
            3. Học tăng cường: Học thông qua tương tác với môi trường
            
            Các thuật toán phổ biến bao gồm hồi quy tuyến tính, cây quyết định,
            mạng nơ-ron và máy vector hỗ trợ.
            """
        }
    ]
    
    try:
        dm = DocumentManager()
        
        for test_file in test_files:
            # Create file
            with open(test_file['filename'], 'w', encoding='utf-8') as f:
                f.write(test_file['content'])
            
            print(f"\n📄 Processing file: {test_file['filename']}")
            
            # Auto-process file
            document = dm.upload_document(test_file['filename'], test_file['filename'].replace('.txt', ''))
            
            print(f"✅ File processed: {document['_id']}")
            print(f"🌍 Language: {document.get('language', 'unknown')}")
            print(f"🏷️  Tags: {', '.join(document.get('tags', []))}")
            print(f"📝 Summary: {document.get('summary', '')[:100]}...")
            
            # Clean up
            os.remove(test_file['filename'])
            print(f"🗑️  Cleaned up {test_file['filename']}")
        
        dm.close()
        print("\n🎉 File processing demo completed!")
        
    except Exception as e:
        print(f"❌ File processing demo failed: {e}")

def main():
    """Run all demos."""
    print("🚀 Automatic AI Processing Demo")
    print("=" * 60)
    
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("⚠️  ANTHROPIC_API_KEY not set. AI features will not work.")
        return
    
    try:
        demo_auto_processing()
        demo_file_processing()
        
        print("\n" + "="*60)
        print("🎊 All demos completed successfully!")
        print("💡 The system now automatically processes documents with AI!")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")

if __name__ == "__main__":
    main()
