# Peblo TV API Reference

This document provides a reference for the RESTful endpoints available in the Peblo TV backend.

## Public / Viewer Endpoints

### 1. Health Check
- **Method**: `GET /health`
- **Description**: Returns backend health and service identifier.
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "peblo-tv-backend"
  }
  ```

### 2. Get Catalogue
- **Method**: `GET /catalog`
- **Description**: Retrieves the full pre-published static catalogue JSON.
- **Response**:
  ```json
  {
    "sections": {
      "featured": [],
      "series": [],
      "minisodes": [],
      "songs": []
    },
    "updated_at": "2026-03-30T00:00:00Z"
  }
  ```

### 3. Search Catalogue
- **Method**: `GET /catalog/search`
- **Query Parameters**:
  - `q` (string, optional): Search keyword matched across show title, category, or episode titles.
  - `category` (string, optional): Filter by category.
  - `language` (string, optional): Filter by audio/subtitle language.
  - `section` (string, optional): Filter by browse section (`featured`, `series`, `minisodes`, `songs`).

## Admin & CMS Endpoints

All admin endpoints accept an `X-User-Role` header (`editor` or `admin`).

### 4. Artwork Upload
- **Method**: `POST /admin/artwork/upload`
- **Headers**: `X-User-Role: editor` or `admin`
- **Form Parameters**:
  - `artwork_type` (`poster` | `banner` | `thumbnail`)
  - `file` (multipart file)
  - `show_id` (optional integer)
  - `episode_id` (optional integer)
- **Validation**:
  - `poster`: Aspect ratio 2:3, Target 600x900, Max 200 KB
  - `banner`: Aspect ratio 16:9, Target 1280x720, Max 200 KB
  - `thumbnail`: Aspect ratio 16:9, Target 640x360, Max 200 KB

### 5. Validation Report
- **Method**: `GET /admin/validation-report`
- **Headers**: `X-User-Role: editor` or `admin`
- **Description**: Identifies missing metadata or artwork blockers preventing publishing.

### 6. Publish Catalogue
- **Method**: `POST /admin/catalog/publish`
- **Headers**: `X-User-Role: admin` (restricted to admin role)
- **Description**: Compiles approved content and atomically replaces `catalogue.json`.

## Error Response Structure
All standard validation errors return a standard JSON envelope:
```json
{
  'detail': 'Detailed human-readable error description.'
}
```

## HTTP Status Codes
- `200 OK`: Successful retrieval or mutation.
- `400 Bad Request`: Validation failure (aspect ratio, file size, missing fields).
- `401 Unauthorized`: Missing or invalid user role header.
- `403 Forbidden`: Admin privileges required.
- `404 Not Found`: Catalog or resource not found.

## Rate Limiting (Production)
Admin publishing is throttled to a maximum of 10 requests per minute to prevent concurrent build thrashing.

## JSON Payload Schemas
Detailed schema definitions for request bodies and query parameters.
- Shows payload includes `id`, `title`, `synopsis`, `section`, `category`, and `status`.
- Episodes payload includes `id`, `title`, `duration_seconds`, `language`, and `video_url`.
