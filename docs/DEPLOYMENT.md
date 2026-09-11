# Deployment & Infrastructure Guide

## Overview
Peblo TV is designed for deployment across containerized environments (Docker, Kubernetes) and serverless CDNs.

## Environment Configuration
- `DATABASE_URL`: Connection string for PostgreSQL (defaults to SQLite locally).
- `TIMESTAMP`: Optional build timestamp injected into the static catalogue payload.
