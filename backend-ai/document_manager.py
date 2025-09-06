#!/usr/bin/env python3
"""
Document Management System with AI Integration
Integrates with Anthropic's Claude 3.5 Sonnet for automatic summarization and tagging.
"""

import os
import sys
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
import logging

# Third-party imports
import pymongo
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from bson import ObjectId
import anthropic
from anthropic import Anthropic
import PyPDF2
import io

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DocumentManager:
    """Main class for document management with AI integration."""
    
    def __init__(self, mongodb_uri: str = "mongodb://localhost:27017/", 
                 database_name: str = "document_manager",
                 collection_name: str = "documents"):
        """
        Initialize the DocumentManager.
        
        Args:
            mongodb_uri: MongoDB connection string
            database_name: Name of the database
            collection_name: Name of the collection
        """
        self.mongodb_uri = mongodb_uri
        self.database_name = database_name
        self.collection_name = collection_name
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.collection: Optional[Collection] = None
        self.anthropic_client: Optional[Anthropic] = None
        
        # Initialize connections
        self._connect_to_mongo()
        self._initialize_anthropic()
    
    def _connect_to_mongo(self) -> None:
        """Connect to MongoDB and initialize collection."""
        try:
            self.client = MongoClient(self.mongodb_uri)
            self.db = self.client[self.database_name]
            self.collection = self.db[self.collection_name]
            
            # Create indexes for better performance
            self.collection.create_index("title")
            self.collection.create_index("tags")
            self.collection.create_index("created_at")
            
            logger.info(f"Connected to MongoDB: {self.database_name}.{self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def _initialize_anthropic(self) -> None:
        """Initialize Anthropic client."""
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not found. AI features will be disabled.")
            return
        
        try:
            self.anthropic_client = Anthropic(api_key=api_key)
            logger.info("Anthropic client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
            self.anthropic_client = None
    
    def read_file_content(self, file_path: str) -> str:
        """
        Read content from various file types.
        
        Args:
            file_path: Path to the file to read
            
        Returns:
            Extracted text content
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_extension = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_extension == '.pdf':
                return self._extract_text_from_pdf(file_path)
            elif file_extension in ['.txt', '.md']:
                return self._extract_text_from_text_file(file_path)
            elif file_extension in ['.docx', '.doc']:
                return self._extract_docx_content(file_path)
            else:
                logger.warning(f"Unsupported file type: {file_extension}")
                return ""
        except Exception as e:
            logger.error(f"Error reading content from {file_path}: {e}")
            raise

    def extract_text_from_file(self, file_path: str) -> str:
        """Alias for read_file_content for backward compatibility."""
        return self.read_file_content(file_path)
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            raise
        
        return text.strip()
    
    def _extract_text_from_text_file(self, file_path: str) -> str:
        """Extract text from text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()

    def _extract_docx_content(self, file_path: str) -> str:
        """
        Extract text content from a .docx file.
        
        Args:
            file_path: Path to the .docx file
            
        Returns:
            Extracted text content
        """
        try:
            with zipfile.ZipFile(file_path, 'r') as docx:
                document_xml = docx.read('word/document.xml')
                root = ET.fromstring(document_xml)
                
                # Define namespaces for Word documents
                namespaces = {
                    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
                }
                
                # Find all text elements
                text_elements = root.findall('.//w:t', namespaces)
                content = ''.join([elem.text or '' for elem in text_elements])
                
                return content.strip()
        except Exception as e:
            raise Exception(f"Failed to extract content from .docx file: {e}")

    def detect_language(self, content: str) -> str:
        """
        Detect if content is Vietnamese or English.
        
        Args:
            content: Text content to analyze
            
        Returns:
            Language code ('vi' for Vietnamese, 'en' for English)
        """
        # Vietnamese diacritics pattern
        vietnamese_pattern = r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]'
        
        # Count Vietnamese characters
        vietnamese_chars = len(re.findall(vietnamese_pattern, content, re.IGNORECASE))
        
        # If more than 5% of characters are Vietnamese diacritics, consider it Vietnamese
        if len(content) > 0 and (vietnamese_chars / len(content)) > 0.05:
            return 'vi'
        else:
            return 'en'

    def get_language_prompts(self, language: str) -> Tuple[str, str]:
        """
        Get appropriate prompts based on language.
        
        Args:
            language: Language code ('vi' or 'en')
            
        Returns:
            Tuple of (summary_prompt, tags_prompt)
        """
        if language == 'vi':
            summary_prompt = "Tóm tắt nội dung tài liệu sau một cách ngắn gọn, không quá 500 từ:"
            tags_prompt = "Dựa trên nội dung tài liệu, đề xuất 3-5 thẻ tag phù hợp:"
        else:
            summary_prompt = "Summarize the following document content in a concise manner, not exceeding 500 words:"
            tags_prompt = "Based on the document content, suggest 3-5 relevant tags or labels:"
        
        return summary_prompt, tags_prompt
    
    def generate_summary(self, content: str) -> Tuple[str, str]:
        """
        Use Claude to summarize the content with language detection.
        
        Args:
            content: Document content to summarize
            
        Returns:
            Tuple of (summary, language)
        """
        if not self.anthropic_client:
            logger.warning("Anthropic client not available. Returning empty summary.")
            return "", "en"
        
        # Detect language
        language = self.detect_language(content)
        
        # Truncate content if too long (roughly 2000 tokens)
        if len(content) > 8000:  # Approximate token limit
            content = content[:8000] + "..."
        
        try:
            # Get language-appropriate prompt
            summary_prompt, _ = self.get_language_prompts(language)
            prompt = f"{summary_prompt}\n\n{content}"
            
            response = self.anthropic_client.messages.create(
                model="claude-opus-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            summary = response.content[0].text.strip()
            
            # Ensure summary doesn't exceed 500 words
            words = summary.split()
            if len(words) > 500:
                summary = " ".join(words[:500]) + "..."
            
            return summary, language
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return "", language
    
    def generate_tags(self, content: str, language: str = None) -> List[str]:
        """
        Use Claude to suggest relevant tags with language support.
        
        Args:
            content: Document content to analyze
            language: Language code ('vi' or 'en')
            
        Returns:
            List of suggested tags
        """
        if not self.anthropic_client:
            logger.warning("Anthropic client not available. Returning empty tags.")
            return []
        
        # Detect language if not provided
        if language is None:
            language = self.detect_language(content)
        
        # Truncate content if too long
        if len(content) > 8000:
            content = content[:8000] + "..."
        
        try:
            # Get language-appropriate prompt
            _, tags_prompt = self.get_language_prompts(language)
            
            if language == 'vi':
                prompt = f"{tags_prompt}\n\n{content}\n\nTrả về danh sách các tag cách nhau bởi dấu phẩy:"
            else:
                prompt = f"{tags_prompt}\n\n{content}\n\nReturn only the tags as a comma-separated list:"
            
            response = self.anthropic_client.messages.create(
                model="claude-opus-4-20250514",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            tags_text = response.content[0].text.strip()
            tags = [tag.strip() for tag in tags_text.split(',') if tag.strip()]
            
            return tags[:10]  # Limit to 10 tags
            
        except Exception as e:
            logger.error(f"Error generating tags: {e}")
            return []

    def suggest_tags(self, content: str) -> List[str]:
        """Alias for generate_tags for backward compatibility."""
        return self.generate_tags(content)

    def process_document(self, content: str, title: str = None) -> str:
        """
        Process a document with AI summarization and tagging.
        
        Args:
            content: Document content to process
            title: Optional title for the document
            
        Returns:
            Document ID of the saved document
        """
        try:
            # Generate AI summary and detect language
            summary, language = self.generate_summary(content)
            
            # Generate tags
            tags = self.generate_tags(content, language)
            
            # Create document
            document = {
                "title": title or "Untitled Document",
                "content": content,
                "summary": summary,
                "tags": tags,
                "language": language,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Save to MongoDB
            if self.collection is None:
                raise Exception("MongoDB collection not initialized")
            
            result = self.collection.insert_one(document)
            document_id = str(result.inserted_id)
            
            logger.info(f"Document processed and saved: {document_id}")
            return document_id
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

    def save_document(self, content: str, summary: str, tags: List[str], 
                     language: str = "en", title: str = None) -> str:
        """
        Save a document to MongoDB.
        
        Args:
            content: Document content
            summary: AI-generated summary
            tags: List of tags
            language: Language code
            title: Document title
            
        Returns:
            Document ID
        """
        try:
            document = {
                "title": title or "Untitled Document",
                "content": content,
                "summary": summary,
                "tags": tags,
                "language": language,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            if self.collection is None:
                raise Exception("MongoDB collection not initialized")
            
            result = self.collection.insert_one(document)
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error saving document: {e}")
            raise

    def review_and_edit_tags(self, suggested_tags: List[str]) -> List[str]:
        """
        Allow user to review and edit suggested tags.
        
        Args:
            suggested_tags: AI-suggested tags
            
        Returns:
            Final list of tags
        """
        if not suggested_tags:
            print("No tags were suggested.")
            user_input = input("Enter tags (comma-separated): ").strip()
            if user_input:
                return [tag.strip() for tag in user_input.split(',') if tag.strip()]
            return []
        
        print(f"\nSuggested tags: {', '.join(suggested_tags)}")
        
        while True:
            edit_choice = input("Do you want to edit the tags? (y/n): ").strip().lower()
            if edit_choice in ['y', 'yes']:
                print("Enter new tags (comma-separated, or press Enter to keep current):")
                user_input = input().strip()
                if user_input:
                    new_tags = [tag.strip() for tag in user_input.split(',') if tag.strip()]
                    return new_tags
                else:
                    return suggested_tags
            elif edit_choice in ['n', 'no']:
                return suggested_tags
            else:
                print("Please enter 'y' or 'n'")

    def display_document_summary(self, document_id: str) -> None:
        """
        Display document summary and details.
        
        Args:
            document_id: Document ID to display
        """
        try:
            document = self.get_document(document_id)
            if not document:
                print("Document not found.")
                return
            
            print("\n" + "="*60)
            print(f"Document ID: {document['_id']}")
            print(f"Title: {document.get('title', 'Untitled')}")
            print(f"Language: {document.get('language', 'en')}")
            print(f"Created: {document.get('created_at', 'Unknown')}")
            print(f"Tags: {', '.join(document.get('tags', []))}")
            print(f"\nSummary:\n{document.get('summary', 'No summary available')}")
            print("="*60)
            
        except Exception as e:
            logger.error(f"Error displaying document: {e}")

    def list_documents_in_directory(self, directory_path: str) -> List[str]:
        """
        List all supported documents in a directory.
        
        Args:
            directory_path: Path to the directory
            
        Returns:
            List of file paths
        """
        supported_extensions = ['.txt', '.md', '.pdf', '.docx', '.doc']
        documents = []
        
        try:
            for filename in os.listdir(directory_path):
                file_path = os.path.join(directory_path, filename)
                if os.path.isfile(file_path):
                    _, ext = os.path.splitext(filename)
                    if ext.lower() in supported_extensions:
                        documents.append(file_path)
        except Exception as e:
            logger.error(f"Error listing documents in directory: {e}")
        
        return documents
    
    def upload_document(self, file_path: str, title: str) -> Dict[str, Any]:
        """
        Upload a document from file with AI processing.
        
        Args:
            file_path: Path to the file to upload
            title: Title for the document
            
        Returns:
            Dictionary containing document details
        """
        logger.info(f"Uploading document: {title}")
        
        # Extract text
        content = self.read_file_content(file_path)
        if not content:
            raise ValueError("No content extracted from file")
        
        # Generate AI summary and detect language
        summary, language = self.generate_summary(content)
        
        # Generate tags
        suggested_tags = self.generate_tags(content, language)
        
        # Display suggested tags and allow editing
        final_tags = self.review_and_edit_tags(suggested_tags)
        
        # Create document
        document = {
            "title": title,
            "content": content,
            "summary": summary,
            "tags": final_tags,
            "language": language,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "file_path": file_path
        }
        
        # Save to MongoDB
        if self.collection is None:
            raise Exception("MongoDB collection not initialized")
        
        result = self.collection.insert_one(document)
        document["_id"] = str(result.inserted_id)
        
        logger.info(f"Document uploaded successfully: {result.inserted_id}")
        return document
    
    def create_new_document(self, title: str, content: str) -> Dict[str, Any]:
        """
        Create a new document from text content.
        
        Args:
            title: Title for the document
            content: Text content of the document
            
        Returns:
            Dictionary containing document details
        """
        logger.info(f"Creating new document: {title}")
        
        # Generate AI summary and detect language
        summary, language = self.generate_summary(content)
        
        # Generate tags
        suggested_tags = self.generate_tags(content, language)
        
        # Display suggested tags and allow editing
        final_tags = self.review_and_edit_tags(suggested_tags)
        
        # Create document
        document = {
            "title": title,
            "content": content,
            "summary": summary,
            "tags": final_tags,
            "language": language,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to MongoDB
        if self.collection is None:
            raise Exception("MongoDB collection not initialized")
        
        result = self.collection.insert_one(document)
        document["_id"] = str(result.inserted_id)
        
        logger.info(f"Document created successfully: {result.inserted_id}")
        return document
    
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a document by ID.
        
        Args:
            document_id: Document ID
            
        Returns:
            Document dictionary or None if not found
        """
        try:
            from bson import ObjectId
            document = self.collection.find_one({"_id": ObjectId(document_id)})
            if document:
                document["_id"] = str(document["_id"])
            return document
        except Exception as e:
            logger.error(f"Error retrieving document {document_id}: {e}")
            return None
    
    def search_documents(self, query: str = "", tags: List[str] = None) -> List[Dict[str, Any]]:
        """
        Search documents by query and tags.
        
        Args:
            query: Text query to search for
            tags: List of tags to filter by
            
        Returns:
            List of matching documents
        """
        search_filter = {}
        
        if query:
            search_filter["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}},
                {"summary": {"$regex": query, "$options": "i"}}
            ]
        
        if tags:
            search_filter["tags"] = {"$in": tags}
        
        try:
            documents = list(self.collection.find(search_filter).sort("created_at", -1))
            for doc in documents:
                doc["_id"] = str(doc["_id"])
            return documents
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []
    
    def close(self) -> None:
        """Close database connection."""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

    def close_connections(self) -> None:
        """Alias for close() for FastAPI compatibility."""
        self.close()


def main():
    """Main console application."""
    print("=== Document Management System with AI Integration ===")
    print("Make sure MongoDB is running and ANTHROPIC_API_KEY is set.")
    print()
    
    # Initialize document manager
    try:
        dm = DocumentManager()
    except Exception as e:
        print(f"Failed to initialize document manager: {e}")
        return
    
    while True:
        print("\nOptions:")
        print("1. Upload document from file")
        print("2. Create new document from text")
        print("3. Search documents")
        print("4. View document by ID")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        try:
            if choice == "1":
                file_path = input("Enter file path: ").strip()
                title = input("Enter document title: ").strip()
                
                if not file_path or not title:
                    print("File path and title are required.")
                    continue
                
                document = dm.upload_document(file_path, title)
                print_document_details(document)
                
            elif choice == "2":
                title = input("Enter document title: ").strip()
                print("Enter document content (press Ctrl+D or Ctrl+Z when done):")
                content_lines = []
                try:
                    while True:
                        line = input()
                        content_lines.append(line)
                except EOFError:
                    pass
                
                content = "\n".join(content_lines)
                
                if not title or not content.strip():
                    print("Title and content are required.")
                    continue
                
                document = dm.create_new_document(title, content)
                print_document_details(document)
                
            elif choice == "3":
                query = input("Enter search query (optional): ").strip()
                tags_input = input("Enter tags to filter by (comma-separated, optional): ").strip()
                tags = [tag.strip() for tag in tags_input.split(',')] if tags_input else None
                
                documents = dm.search_documents(query, tags)
                print(f"\nFound {len(documents)} documents:")
                for doc in documents:
                    print(f"- {doc['title']} (ID: {doc['_id']})")
                    print(f"  Tags: {', '.join(doc.get('tags', []))}")
                    print(f"  Created: {doc['created_at']}")
                    print()
                
            elif choice == "4":
                doc_id = input("Enter document ID: ").strip()
                document = dm.get_document(doc_id)
                if document:
                    print_document_details(document)
                else:
                    print("Document not found.")
                    
            elif choice == "5":
                print("Goodbye!")
                break
                
            else:
                print("Invalid choice. Please enter 1-5.")
                
        except KeyboardInterrupt:
            print("\nOperation cancelled.")
        except Exception as e:
            print(f"Error: {e}")
    
    # Clean up
    dm.close()


def print_document_details(document: Dict[str, Any]) -> None:
    """Print document details in a formatted way."""
    print("\n" + "="*50)
    print(f"Document ID: {document['_id']}")
    print(f"Title: {document['title']}")
    print(f"Created: {document['created_at']}")
    print(f"Tags: {', '.join(document.get('tags', []))}")
    print(f"\nSummary:\n{document.get('summary', 'No summary available')}")
    print("="*50)


if __name__ == "__main__":
    main()
