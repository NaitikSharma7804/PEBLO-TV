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

## Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Vite Dev Server**:
   ```bash
   npm run dev
   ```

## Docker Compose Deployment

To spin up all services (PostgreSQL, FastAPI Backend, and Vite Frontend) in containers:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: `localhost:5432` (`peblo` database)

## Database Reset & Seeding
To clear and recreate local SQLite database tables:
```bash
rm peblo.db
python -c 'from app.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)'
```
