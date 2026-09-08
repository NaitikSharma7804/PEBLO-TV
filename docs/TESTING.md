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
