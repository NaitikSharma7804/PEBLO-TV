# Peblo TV Architecture Overview

This document describes the high-level architecture of the Peblo TV platform, outlining the interaction between the transactional CMS, database, storage layers, and static publishing pipeline.

## System Components

1. **Transactional CMS Backend (FastAPI)**:
   - Exposes RESTful endpoints for editors and administrators.
   - Handles authentication, metadata CRUD (shows, seasons, episodes), and image file uploads.
   - Enforces business validation rules prior to publishing.

2. **Relational Database (SQLAlchemy / PostgreSQL / SQLite)**:
   - Persists all relational entities including Shows, Seasons, Episodes, Artworks, and PublishRuns.
   - Uses strict cascade rules and unique constraints to ensure referential integrity.

3. **Storage Layer**:
   - Manages media assets (posters, banners, thumbnails).
   - Designed around a pluggable `StorageService` interface allowing local disk or Cloudflare R2 / S3 storage.

## Atomic Static Publishing Workflow

The platform decouples viewer traffic from database load through an atomic static publishing mechanism:

```
[CMS Editor] -> [Admin API /publish] -> [Compile JSON in Memory]
                                                   |
                                                   v
                                        [Write catalogue.json.tmp]
                                                   |
                                                   v (os.replace)
                                        [Live catalogue.json]
                                                   |
                                                   v
                                        [Viewer Client / Search]
```

- **Guarantees**: Write operations never expose partial files; if an interrupted write occurs, the temporary file is ignored and the live catalog stays intact.
- **Performance**: Static JSON serving yields sub-millisecond responses without querying the primary database.

## Content Group Collapsing Algorithm

When publishing, episodes with identical `content_group` identifiers collapse into a single presentation item:

```python
# Pseudo-code logic:
for ep in season.episodes:
    if ep.content_group not in group_map:
        group_map[ep.content_group] = { ...ep, 'languages': [] }
    group_map[ep.content_group]['languages'].append({ 'language': ep.language, 'video_url': ep.video_url })
```
- Eliminates duplicate cards on viewer UI across different audio and subtitle language tracks.
