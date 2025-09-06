#!/usr/bin/env python3
"""
Simple AI test without MongoDB dependency
"""

import os
import sys
from anthropic import Anthropic

def test_anthropic_api():
    """Test Anthropic API directly"""
    try:
        # Get API key from environment
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            print("❌ Error: ANTHROPIC_API_KEY environment variable is not set")
            return False
        
        client = Anthropic(api_key=api_key)
        
        # Test with simple text
        test_content = """
        Đây là một tài liệu về quản lý dự án. 
        Tài liệu này mô tả các phương pháp quản lý dự án hiệu quả, 
        bao gồm lập kế hoạch, theo dõi tiến độ, và quản lý rủi ro.
        """
        
        print("🤖 Testing Anthropic API...")
        print("=" * 50)
        
        # Test summarization
        summary_response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"Tóm tắt nội dung tài liệu sau một cách ngắn gọn, không quá 500 từ:\n\n{test_content}"
            }]
        )
        
        summary = summary_response.content[0].text
        print(f"✅ Summary: {summary}")
        
        # Test tagging
        tag_response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": f"Dựa trên nội dung tài liệu, đề xuất 3-5 thẻ tag phù hợp:\n\n{test_content}"
            }]
        )
        
        tags_text = tag_response.content[0].text
        tags = [tag.strip() for tag in tags_text.split(',')]
        print(f"✅ Tags: {tags}")
        
        print("=" * 50)
        print("🎉 AI API test successful!")
        
        return True
        
    except Exception as e:
        print(f"❌ AI API test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_anthropic_api()
    sys.exit(0 if success else 1)
