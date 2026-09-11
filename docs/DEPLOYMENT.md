# Deployment & Infrastructure Guide

## Overview
Peblo TV is designed for deployment across containerized environments (Docker, Kubernetes) and serverless CDNs.

## Environment Configuration
- `DATABASE_URL`: Connection string for PostgreSQL (defaults to SQLite locally).
- `TIMESTAMP`: Optional build timestamp injected into the static catalogue payload.

## Volume Persistence
Persistent storage volume `uploads` must be mounted across container restarts for local storage mode.

## Reverse Proxy Configuration
In production, Nginx or Cloudflare should terminate TLS and serve static media directly.
