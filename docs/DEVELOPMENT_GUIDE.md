# Local Development & Setup Guide

This guide walks through setting up the Peblo TV development environment, testing services, and running database migrations.

## Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (or local SQLite fallback)

## Backend Setup

1. **Create and Activate Virtual Environment**:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   # macOS / Linux:
   source .venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirement.txt
   ```

3. **Run Backend API Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Verify Health Endpoint**:
   ```bash
   curl http://localhost:8000/health
   ```
