# Testing Guide

This guide outlines testing strategies for backend endpoints and validation constraints.

## Health Check Verification
Execute:
```bash
curl -i http://localhost:8000/health
```

## Artwork Validation Testing
Verify image uploads with varying aspect ratios:
- Expect 200 for valid 2:3 posters and 16:9 banners.
- Expect 400 with detail error for mismatched aspect ratios.

## File Size Limits Testing
Upload an image exceeding 200 KB to verify rejection:
```bash
curl -X POST http://localhost:8000/admin/artwork/upload -F 'file=@large_image.jpg'
```

## Catalogue Search Endpoint Testing
Verify compound filtering across query string, section, and language:
```bash
curl 'http://localhost:8000/catalog/search?q=adventure&language=en'
```
