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

### Seasons (`seasons`)
- Grouping of episodes under a show.
- `season_number = 0` is reserved for promotional trailers.
- Unique constraint: `(show_id, season_number)` ensures unique season sequencing.

### Episodes (`episodes`)
- Individual video content.
- Unique constraint: `(content_group, language)` enforces localized variant pairing.

### Artworks (`artworks`)
- Attached either to a show or an episode.
- Tracks `artwork_type`, dimensions (`width`, `height`), size (`file_size_kb`), and file path.

### Publish Runs (`publish_runs`)
- Audit log of catalogue publications.
- Records `triggered_by`, execution `status`, show/episode counts, and timestamps.

## Cascade Delete Strategy
- `shows` -> `seasons` (`cascade='all, delete-orphan'`)
- `seasons` -> `episodes` (`cascade='all, delete-orphan'`)
- `shows`/`episodes` -> `artworks` (`ondelete='CASCADE'`)

## Indexing Details
- B-tree indices on `shows.title`, `shows.section`, `shows.category`, `shows.status`.
- Composite unique index on `(content_group, language)`.
