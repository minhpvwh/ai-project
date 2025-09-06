# Document Management System with AI Integration

A comprehensive Python-based document management system that integrates with Anthropic's Claude-Opus-4 AI for automatic document summarization, intelligent tagging, and multi-language support.

## Features

- **🤖 AI-Powered Summarization**: Automatically generates concise summaries (max 500 words) using Claude-Opus-4
- **🏷️ Intelligent Tagging**: AI suggests 3-5 relevant tags for documents
- **🌍 Multi-Language Support**: Supports both Vietnamese and English with automatic language detection
- **📄 Multiple File Formats**: Supports PDF, TXT, MD, DOCX, DOC files
- **✏️ Interactive Tag Editing**: Users can review and modify AI-suggested tags before saving
- **💾 MongoDB Storage**: Persistent storage with efficient indexing and language metadata
- **🔍 Search Functionality**: Full-text search across titles, content, and summaries
- **🖥️ Console Interface**: Easy-to-use command-line interface
- **🌐 REST API**: FastAPI endpoints for frontend integration
- **📁 Batch Processing**: Process multiple documents from directories

## Requirements

- Python 3.8+
- MongoDB 5.0+
- Anthropic API key

## Installation

1. **Clone or download the project**
   ```bash
   cd backend-ai
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Ensure MongoDB is running on `mongodb://localhost:27017/`

4. **Set up Anthropic API**
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```
   
   Or create a `.env` file:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```

## Usage

### Running the Application

```bash
python document_manager.py
```

### Menu Options

1. **Upload document from file**: Upload PDF, TXT, or MD files
2. **Create new document from text**: Create documents from text input
3. **Search documents**: Search by query and tags
4. **View document by ID**: Retrieve specific documents
5. **Exit**: Close the application

### Example Workflow

1. **Upload a PDF document**:
   - Select option 1
   - Enter file path: `/path/to/document.pdf`
   - Enter title: `My Document`
   - Review AI-suggested tags and edit if needed
   - Document is saved with AI-generated summary

2. **Create a text document**:
   - Select option 2
   - Enter title: `Meeting Notes`
   - Enter content (multi-line input)
   - Review and edit suggested tags
   - Document is saved with AI summary

## API Integration

### Claude-Opus-4 Integration

The system uses Anthropic's Claude-Opus-4 model for:
- **Summarization**: Generates concise summaries with 500-word limit
- **Tagging**: Suggests 3-5 relevant tags based on content analysis
- **Language Detection**: Automatically detects Vietnamese vs English content

### REST API Endpoints

The system provides FastAPI endpoints for frontend integration:

- `POST /api/ai/process-text` - Process text documents
- `POST /api/ai/process-file` - Process uploaded files
- `GET /api/ai/documents` - Get processed documents
- `GET /api/ai/health` - Health check

### Starting the API Server

```bash
python run_ai_server.py
```

API Documentation: http://localhost:8001/docs

### MongoDB Schema

Documents are stored with the following structure:
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "summary": "string",
  "tags": ["string"],
  "language": "string", // "vi" or "en"
  "created_at": "datetime",
  "updated_at": "datetime",
  "file_path": "string" // for uploaded files
}
```

## Language Support

The system automatically detects the language of documents and processes them accordingly:

- **Vietnamese (vi)**: Uses Vietnamese prompts for summarization and tagging
- **English (en)**: Uses English prompts for summarization and tagging
- **Language Detection**: Based on Vietnamese diacritics and character patterns

### AI Prompts

- **Vietnamese Summarization**: "Tóm tắt nội dung tài liệu sau một cách ngắn gọn, không quá 500 từ:"
- **English Summarization**: "Summarize the following document content in a concise manner, not exceeding 500 words:"
- **Vietnamese Tagging**: "Dựa trên nội dung tài liệu, đề xuất 3-5 thẻ tag phù hợp:"
- **English Tagging**: "Based on the document content, suggest 3-5 relevant tags or labels:"

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY`: Required for AI features
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/`)
- `DATABASE_NAME`: Database name (default: `document_manager`)

### File Limits

- Maximum file size: 10MB (configurable)
- Supported formats: PDF, TXT, MD
- Content truncation: ~8000 characters for AI processing

## Error Handling

The system includes comprehensive error handling for:
- File not found errors
- MongoDB connection issues
- Anthropic API failures
- Invalid file formats
- Network timeouts

## Testing

Run the included test cases:

```bash
python -m pytest test_document_manager.py -v
```

## Security Considerations

- API keys are loaded from environment variables
- Input validation for all user inputs
- Safe file handling with proper error checking
- MongoDB injection prevention through parameterized queries

## Performance

- Database indexing on title, tags, and created_at
- Content truncation for large documents
- Efficient text extraction from PDFs
- Cached MongoDB connections

## Future Enhancements

- Web interface
- Batch document processing
- Advanced search filters
- Document versioning
- Cloud storage integration
- Real-time collaboration features

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string

2. **Anthropic API Error**
   - Verify API key is set correctly
   - Check API rate limits

3. **PDF Extraction Issues**
   - Ensure PDF is not password-protected
   - Check file permissions

4. **Memory Issues with Large Files**
   - System automatically truncates large content
   - Consider splitting very large documents

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.
