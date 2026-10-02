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
