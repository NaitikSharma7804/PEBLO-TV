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

## Validation Report Endpoint Testing
Call `GET /admin/validation-report` with `X-User-Role: editor` to inspect blocking issues.

## Automated Smoke Tests
Run smoke test suite against running server:
```bash
python -m unittest discover tests
```

## Mocking Image Payloads
Generate minimal JPEG bytes for testing using PIL:
```python
from PIL import Image
import io
im = Image.new('RGB', (600, 900), color='blue')
buf = io.BytesIO()
im.save(buf, format='JPEG')
```

## Testing Atomic Publishing Concurrency
Run parallel curl requests to ensure reader processes never hit partial file reads during publishing.

## Frontend Contract Verification
Verify that JSON structure emitted by `/catalog` exactly matches the TypeScript schema expected in the viewer UI.

## Testing Role Header Constraints
Verify that omitting `X-User-Role` returns 401 Unauthorized for admin upload routes.
