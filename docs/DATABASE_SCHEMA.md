# Peblo TV Database Schema Guide

This document describes the relational database structure, model entities, and constraints in the Peblo TV backend.

## Entity-Relationship Diagram

```
+--------------------+           +--------------------+           +--------------------+
|       shows        | 1       N |      seasons       | 1       N |      episodes      |
|--------------------|-----------|--------------------|-----------|--------------------|
| id (PK)            |           | id (PK)            |           | id (PK)            |
| title              |           | show_id (FK)       |           | season_id (FK)     |
| synopsis           |           | season_number      |           | title              |
| section            |           | title              |           | episode_number     |
| category           |           +--------------------+           | duration_seconds   |
| status             |                                            | language           |
| created_at         |                                            | content_group      |
| updated_at         |                                            | video_url          |
+--------------------+                                            +--------------------+
          | 1                                                               | 1
          |                                                                 |
          | N                                                               | N
+--------------------------------------------------------------------------------------+
|                                       artworks                                       |
|--------------------------------------------------------------------------------------|
| id (PK), show_id (FK nullable), episode_id (FK nullable), artwork_type, file_path     |
+--------------------------------------------------------------------------------------+
```

## Model Entities

### Shows (`shows`)
- Primary entity representing content categories (`featured`, `series`, `minisodes`, `songs`).
- Status can be `draft` or `published`.
- Has foreign keys cascaded to seasons and artworks.
