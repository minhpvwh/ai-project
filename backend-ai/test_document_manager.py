#!/usr/bin/env python3
"""
Test script for DocumentManager functionality
"""

import os
import sys
from document_manager import DocumentManager

def test_basic_functionality():
    """Test basic document manager functionality."""
    print("🧪 Testing DocumentManager functionality...")
    
    try:
        # Initialize document manager
        dm = DocumentManager()
        print("✅ DocumentManager initialized successfully")
        
        # Test language detection
        vietnamese_text = "Đây là một tài liệu tiếng Việt với các dấu thanh điệu."
        english_text = "This is an English document without diacritics."
        
        vi_lang = dm.detect_language(vietnamese_text)
        en_lang = dm.detect_language(english_text)
        
        print(f"✅ Language detection - Vietnamese: {vi_lang}, English: {en_lang}")
        
        # Test AI processing (if API key is available)
        if dm.anthropic_client:
            print("🤖 Testing AI processing...")
            
            # Test summary generation
            summary, language = dm.generate_summary(english_text)
            print(f"✅ Summary generated: {summary[:100]}...")
            print(f"✅ Detected language: {language}")
            
            # Test tag generation
            tags = dm.generate_tags(english_text, language)
            print(f"✅ Tags generated: {tags}")
            
            # Test document processing
            doc_id = dm.process_document(english_text, "Test Document")
            print(f"✅ Document processed and saved: {doc_id}")
            
            # Test document retrieval
            document = dm.get_document(doc_id)
            if document:
                print(f"✅ Document retrieved: {document['title']}")
                print(f"✅ Document language: {document.get('language', 'unknown')}")
                print(f"✅ Document tags: {document.get('tags', [])}")
            
        else:
            print("⚠️  Anthropic API key not available, skipping AI tests")
        
        # Test file reading (if test files exist)
        test_files = [
            "test.txt",
            "test.md", 
            "test.pdf",
            "test.docx"
        ]
        
        for test_file in test_files:
            if os.path.exists(test_file):
                try:
                    content = dm.read_file_content(test_file)
                    print(f"✅ Successfully read {test_file}: {len(content)} characters")
                except Exception as e:
                    print(f"❌ Error reading {test_file}: {e}")
        
        # Clean up
        dm.close()
        print("✅ DocumentManager closed successfully")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

def test_file_processing():
    """Test file processing capabilities."""
    print("\n📁 Testing file processing...")
    
    # Create test files
    test_content = "This is a test document for AI processing. It contains some sample text to test summarization and tagging functionality."
    
    # Create test.txt
    with open("test.txt", "w", encoding="utf-8") as f:
        f.write(test_content)
    print("✅ Created test.txt")
    
    # Create test.md
    with open("test.md", "w", encoding="utf-8") as f:
        f.write(f"# Test Document\n\n{test_content}")
    print("✅ Created test.md")
    
    try:
        dm = DocumentManager()
        
        # Test text file reading
        content = dm.read_file_content("test.txt")
        print(f"✅ Read test.txt: {len(content)} characters")
        
        # Test markdown file reading
        content = dm.read_file_content("test.md")
        print(f"✅ Read test.md: {len(content)} characters")
        
        # Test AI processing
        if dm.anthropic_client:
            summary, language = dm.generate_summary(content)
            tags = dm.generate_tags(content, language)
            
            print(f"✅ AI Summary: {summary[:100]}...")
            print(f"✅ AI Tags: {tags}")
            print(f"✅ Language: {language}")
        
        dm.close()
        
    except Exception as e:
        print(f"❌ File processing test failed: {e}")
        return False
    
    finally:
        # Clean up test files
        for test_file in ["test.txt", "test.md"]:
            if os.path.exists(test_file):
                os.remove(test_file)
                print(f"✅ Cleaned up {test_file}")
    
    return True

def main():
    """Run all tests."""
    print("🚀 Starting DocumentManager tests...")
    print("=" * 50)
    
    # Check environment
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("⚠️  ANTHROPIC_API_KEY not set. AI features will be tested with mock data.")
    
    # Run tests
    tests = [
        test_basic_functionality,
        test_file_processing
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())