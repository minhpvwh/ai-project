# Knowledge Hub API Contract

## Base URL
```
http://localhost:8080/api
```

## Authentication
Tất cả API endpoints (trừ auth) yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "message": "Login successful"
}
```

**Response (400):**
```json
{
  "error": "Invalid username or password"
}
```

### 1.2 Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "email": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "message": "Login successful"
}
```

### 1.3 Validate Token
**POST** `/auth/validate`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "valid": true,
  "username": "string",
  "fullName": "string",
  "email": "string"
}
```

---

## 2. Document APIs

### 2.1 Upload Document
**POST** `/documents/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (required)
- `title`: string (required)
- `description`: string (required)
- `tags`: string[] (optional)
- `visibility`: "PRIVATE" | "GROUP" | "PUBLIC" (default: "PRIVATE")

**Response (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "fileName": "string",
  "fileType": "string",
  "fileSize": 0,
  "tags": ["string"],
  "visibility": "PRIVATE",
  "summary": "string",
  "ownerName": "string",
  "ownerId": "string",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "viewCount": 0,
  "averageRating": 0.0,
  "totalRatings": 0
}
```

### 2.2 Search Documents
**GET** `/documents/search`

**Query Parameters:**
- `q`: string (optional) - Search text
- `tags`: string[] (optional) - Filter by tags
- `visibility`: "PRIVATE" | "GROUP" | "PUBLIC" (optional)
- `page`: number (default: 0)
- `size`: number (default: 10)

**Response (200):**
```json
{
  "content": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "fileName": "string",
      "fileType": "string",
      "fileSize": 0,
      "tags": ["string"],
      "visibility": "PRIVATE",
      "summary": "string",
      "ownerName": "string",
      "ownerId": "string",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00",
      "viewCount": 0,
      "averageRating": 0.0,
      "totalRatings": 0
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 0,
  "totalPages": 0,
  "last": true,
  "first": true,
  "numberOfElements": 0
}
```

### 2.3 Get Recent Documents
**GET** `/documents/recent`

**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 5)

**Response (200):** Same as search response

### 2.4 Get Popular Documents
**GET** `/documents/popular`

**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 5)

**Response (200):** Same as search response

### 2.5 Get My Documents
**GET** `/documents/my-documents`

**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 10)

**Response (200):** Same as search response

### 2.6 Get Document by ID
**GET** `/documents/{id}`

**Response (200):** Single document object (same structure as upload response)

**Response (404):**
```json
{
  "error": "Document not found"
}
```

### 2.7 Update Document
**PUT** `/documents/{id}`

**Form Data:**
- `title`: string (optional)
- `description`: string (optional)
- `tags`: string[] (optional)
- `visibility`: "PRIVATE" | "GROUP" | "PUBLIC" (optional)

**Response (200):** Updated document object

### 2.8 Delete Document
**DELETE** `/documents/{id}`

**Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

### 2.9 Download Document
**GET** `/documents/{id}/download`

**Response (200):**
```json
{
  "filePath": "string",
  "fileName": "string",
  "fileType": "string"
}
```

---

## 3. Comment APIs

### 3.1 Add Comment
**POST** `/comments/{documentId}`

**Request Body:**
```json
{
  "content": "string"
}
```

**Response (200):**
```json
{
  "id": "string",
  "content": "string",
  "authorName": "string",
  "authorId": "string",
  "createdAt": "2024-01-01T00:00:00"
}
```

### 3.2 Get Document Comments
**GET** `/comments/{documentId}`

**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 10)

**Response (200):**
```json
{
  "content": [
    {
      "id": "string",
      "content": "string",
      "authorName": "string",
      "authorId": "string",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 0,
  "totalPages": 0,
  "last": true,
  "first": true,
  "numberOfElements": 0
}
```

### 3.3 Update Comment
**PUT** `/comments/{commentId}`

**Request Body:**
```json
{
  "content": "string"
}
```

**Response (200):**
```json
{
  "id": "string",
  "content": "string",
  "authorName": "string",
  "authorId": "string",
  "updatedAt": "2024-01-01T00:00:00"
}
```

### 3.4 Delete Comment
**DELETE** `/comments/{commentId}`

**Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## 4. Rating APIs

### 4.1 Add/Update Rating
**POST** `/ratings/{documentId}`

**Request Body:**
```json
{
  "score": 5
}
```

**Response (200):**
```json
{
  "id": "string",
  "score": 5,
  "userId": "string",
  "documentId": "string",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "documentAverageRating": 4.5,
  "documentTotalRatings": 10
}
```

### 4.2 Get User Rating
**GET** `/ratings/{documentId}/user`

**Response (200):**
```json
{
  "hasRating": true,
  "score": 5,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

### 4.3 Get Document Ratings
**GET** `/ratings/{documentId}/all`

**Response (200):**
```json
{
  "ratings": [
    {
      "id": "string",
      "score": 5,
      "userName": "string",
      "userId": "string",
      "createdAt": "2024-01-01T00:00:00"
    }
  ],
  "averageRating": 4.5,
  "totalRatings": 10
}
```

### 4.4 Delete Rating
**DELETE** `/ratings/{ratingId}`

**Response (200):**
```json
{
  "message": "Rating deleted successfully"
}
```

---

## 5. Home APIs

### 5.1 Get Dashboard Data
**GET** `/home/dashboard`

**Response (200):**
```json
{
  "recentDocuments": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "fileName": "string",
      "fileType": "string",
      "fileSize": 0,
      "tags": ["string"],
      "visibility": "PRIVATE",
      "summary": "string",
      "ownerName": "string",
      "ownerId": "string",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00",
      "viewCount": 0,
      "averageRating": 0.0,
      "totalRatings": 0
    }
  ],
  "popularDocuments": [
    // Same structure as recentDocuments
  ],
  "myRecentDocuments": [
    // Same structure as recentDocuments
  ]
}
```

---

## Error Responses

### Common Error Format
```json
{
  "error": "Error message"
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors, invalid data)
- `401`: Unauthorized (invalid/missing JWT token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Common Error Messages
- "Invalid username or password"
- "Username already exists"
- "Email already exists"
- "Document not found"
- "Not authorized to update this document"
- "File size exceeds 10MB limit"
- "File type not allowed"
- "Rating must be between 1 and 5"
- "Comment content cannot be empty"

---

## File Upload Constraints

### Supported File Types
- PDF: `application/pdf`
- DOC: `application/msword`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- JPG: `image/jpeg`
- PNG: `image/png`

### File Size Limit
- Maximum: 10MB

### Visibility Options
- `PRIVATE`: Only owner can view
- `GROUP`: Colleagues can view
- `PUBLIC`: Everyone can view

---

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (0-based, default: 0)
- `size`: Page size (default: 10)

Response includes pagination metadata:
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `last`: Whether this is the last page
- `first`: Whether this is the first page
- `numberOfElements`: Number of elements in current page
