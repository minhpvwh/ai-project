#!/usr/bin/env python3
"""
AI Controller for Document Processing
====================================

FastAPI endpoints for AI-powered document processing integration.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
from pathlib import Path

# Import our document manager
from document_manager import DocumentManager
from bson import ObjectId

app = FastAPI(title="AI Document Processing API", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize document manager
doc_manager = None

@app.on_event("startup")
async def startup_event():
    """Initialize the document manager on startup."""
    global doc_manager
    try:
        doc_manager = DocumentManager()
        print("✓ AI Document Manager initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize AI Document Manager: {e}")
        raise

# Pydantic models
class DocumentResponse(BaseModel):
    id: str
    content: str
    summary: str
    tags: List[str]
    language: str
    success: bool
    message: str

class ProcessDocumentRequest(BaseModel):
    content: str
    title: Optional[str] = None

@app.post("/api/ai/process-text", response_model=DocumentResponse)
async def process_text_document(request: ProcessDocumentRequest):
    """
    Process a text document with AI summarization and tagging.
    """
    try:
        if not doc_manager:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Process the document
        doc_id = doc_manager.process_document(request.content)
        
        if not doc_id:
            raise HTTPException(status_code=500, detail="Failed to process document")
        
        # Get the saved document
        saved_doc = doc_manager.collection.find_one({'_id': ObjectId(doc_id)})
        if not saved_doc:
            raise HTTPException(status_code=500, detail="Document not found after processing")
        
        return DocumentResponse(
            id=str(saved_doc['_id']),
            content=saved_doc['content'],
            summary=saved_doc['summary'],
            tags=saved_doc['tags'],
            language=saved_doc.get('language', 'en'),
            success=True,
            message="Document processed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/api/ai/process-file", response_model=DocumentResponse)
async def process_file_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
):
    """
    Process an uploaded file with AI summarization and tagging.
    """
    try:
        if not doc_manager:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        # Check file type
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ['.txt', '.md', '.docx', '.doc', '.pdf', '.rtf', '.odt']:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Read file content
            file_content = doc_manager.read_file_content(temp_file_path)
            
            if not file_content.strip():
                raise HTTPException(status_code=400, detail="File appears to be empty")
            
            # Process the document
            doc_id = doc_manager.process_document(file_content)
            
            if not doc_id:
                raise HTTPException(status_code=500, detail="Failed to process document")
            
            # Get the saved document
            saved_doc = doc_manager.collection.find_one({'_id': ObjectId(doc_id)})
            if not saved_doc:
                raise HTTPException(status_code=500, detail="Document not found after processing")
            
            return DocumentResponse(
                id=str(saved_doc['_id']),
                content=saved_doc['content'],
                summary=saved_doc['summary'],
                tags=saved_doc['tags'],
                language=saved_doc.get('language', 'en'),
                success=True,
                message="File processed successfully"
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/ai/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "ai_service": "available" if doc_manager else "unavailable",
        "mongodb": "connected" if doc_manager and doc_manager.collection else "disconnected"
    }

@app.get("/api/ai/documents")
async def get_documents(skip: int = 0, limit: int = 10):
    """Get processed documents."""
    try:
        if not doc_manager or not doc_manager.collection:
            raise HTTPException(status_code=500, detail="Database not available")
        
        documents = list(doc_manager.collection.find().skip(skip).limit(limit).sort("created_at", -1))
        
        result = []
        for doc in documents:
            result.append({
                "id": str(doc['_id']),
                "summary": doc['summary'],
                "tags": doc['tags'],
                "language": doc.get('language', 'en'),
                "created_at": doc['created_at'].isoformat(),
                "content_preview": doc['content'][:200] + "..." if len(doc['content']) > 200 else doc['content']
            })
        
        return {"documents": result, "total": len(result)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
