from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from app.database import engine, SessionLocal, Base
from app.models import Show, Season, Episode, Artwork, PublishRun
from app.storage import LocalStorageService, validate_and_process_artwork, ARTWORK_SPECS
from app.auth import get_current_user_role, require_admin

# Create database tables automatically for local execution/docker
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Peblo TV Mini API", version="1.0")
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Peblo TV Mini API", version="1.0")

# --- ADD THIS CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing/development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers (including X-User-Role)
)
storage = LocalStorageService()
//hello comment
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "peblo-tv-backend"}

# --- ARTWORK UPLOAD & SHOW/EPISODE CRUD ---

@app.post("/admin/artwork/upload")
def upload_artwork(
    artwork_type: str = Form(...), # poster, banner, thumbnail
    show_id: Optional[int] = Form(None),
    episode_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    role: str = Depends(get_current_user_role)
):
    file_bytes = file.file.read()
    filename = file.filename or "upload.jpg"
    
    # Validate dimensions, aspect ratio, and size ceiling (200 KB)
    width, height, file_size_kb = validate_and_process_artwork(file_bytes, filename, artwork_type)
    
    # Save via storage abstraction
    saved_path = storage.save_file(file_bytes, f"{artwork_type}_{filename}")
    
    artwork = Artwork(
        show_id=show_id,
        episode_id=episode_id,
        artwork_type=artwork_type,
        file_path=saved_path,
        file_size_kb=file_size_kb,
        width=width,
        height=height
    )
    db.add(artwork)
    db.commit()
    db.refresh(artwork)
    
    return {"id": artwork.id, "artwork_type": artwork_type, "file_path": saved_path, "size_kb": file_size_kb}


@app.get("/admin/validation-report")
def get_validation_report(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    """Surfaces everything currently blocking publish, grouped for editors."""
    shows = db.query(Show).all()
    blocking_issues = []

    for show in shows:
        show_issues = []
        # Rule: Published show must have a section
        if show.status == "published" and not show.section:
            show_issues.append("Show is marked published but lacks a required section.")
            
        # Check artwork existence
        has_poster = any(a.artwork_type == "poster" for a in show.artworks)
        if not has_poster:
            show_issues.append("Missing required 'poster' artwork.")

        # Check episodes
        episodes_without_duration = db.query(Episode).join(Season).filter(Season.show_id == show.id, Episode.duration_seconds == None).all()
        if episodes_without_duration:
            show_issues.append(f"{len(episodes_without_duration)} episode(s) missing required duration.")

        if show_issues:
            blocking_issues.append({
                "show_id": show.id,
                "show_title": show.title,
                "issues": show_issues
            })

    return {"blockers_count": len(blocking_issues), "blocking_reports": blocking_issues}


@app.post("/admin/catalog/publish")
def publish_catalog(
    db: Session = Depends(get_db),
    admin_role: str = Depends(require_admin)
):
    """
    Builds the catalogue JSON and writes it to storage atomically.
    Only published shows appear, content_group variants collapse into one entry with a language list,
    and Season 0 (trailers) is filtered out of standard browse rows.
    """
    published_shows = db.query(Show).filter(Show.status == "published").all()
    
    sections_map = {"featured": [], "series": [], "minisodes": [], "songs": []}
    total_episodes_count = 0

    for show in published_shows:
        show_data = {
            "id": show.id,
            "title": show.title,
            "synopsis": show.synopsis,
            "category": show.category,
            "artworks": [{"type": a.artwork_type, "path": a.file_path} for a in show.artworks],
            "seasons": []
        }

        # Exclude Season 0 (reserved for trailers) from normal viewer browse rows
        valid_seasons = [s for s in show.seasons if s.season_number != 0]

        for season in valid_seasons:
            # Handle content_group collapsing: episodes sharing a content_group collapse into ONE entry with available languages
            group_map = {}
            for ep in season.episodes:
                key = ep.content_group
                if key not in group_map:
                    group_map[key] = {
                        "content_group": ep.content_group,
                        "title": ep.title,
                        "episode_number": ep.episode_number,
                        "duration_seconds": ep.duration_seconds,
                        "video_url": ep.video_url,
                        "languages": []
                    }
                group_map[key]["languages"].append({
                    "language": ep.language,
                    "video_url": ep.video_url
                })
                total_episodes_count += 1

            show_data["seasons"].append({
                "season_number": season.season_number,
                "title": season.title,
                "episodes": list(group_map.values())
            })

        if show.section in sections_map:
            sections_map[show.section].append(show_data)

    catalogue_payload = {
        "sections": sections_map,
        "updated_at": os.getenv("TIMESTAMP", "2026-03-30T00:00:00Z")
    }

    # Atomic write pattern: Write to temp file first, then atomically rename over target
    target_path = "catalogue.json"
    temp_path = "catalogue.json.tmp"
    
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(catalogue_payload, f, indent=2)
        os.replace(temp_path, target_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Publish failed during file write: {str(e)}")

    # Record publish run audit log
    run = PublishRun(
        triggered_by="admin_user",
        status="success",
        shows_count=len(published_shows),
        episodes_count=total_episodes_count
    )
    db.add(run)
    db.commit()

    return {"status": "success", "message": "Catalog published successfully", "shows_published": len(published_shows)}


@app.get("/catalog")
def get_viewer_catalog():
    """Serves the pre-published static catalog file for the Netflix-style viewer UI."""
    if not os.path.exists("catalogue.json"):
        raise HTTPException(status_code=404, detail="Catalog has not been published yet.")
    with open("catalogue.json", "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/catalog/search")
def search_catalog(
    q: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    section: Optional[str] = None
):
    """Viewer search and filter endpoint compounding queries across title, category, language, and section."""
    if not os.path.exists("catalogue.json"):
        return {"results": []}

    with open("catalogue.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    sections = data.get("sections", {})
    matched_shows = []

    target_sections = [section] if section and section in sections else sections.keys()

    for sec_name in target_sections:
        for show in sections.get(sec_name, []):
            # Category filter
            if category and show.get("category") != category:
                continue

            # Query match (show title or category)
            q_match = True
            if q:
                q_lower = q.lower()
                title_match = q_lower in show.get("title", "").lower()
                cat_match = q_lower in show.get("category", "").lower()
                
                # Also check episode titles inside the show
                ep_match = False
                for season in show.get("seasons", []):
                    for ep in season.get("episodes", []):
                        if q_lower in ep.get("title", "").lower():
                            ep_match = True
                            break
                q_match = title_match or cat_match or ep_match

            if not q_match:
                continue

            # Language filter check
            if language:
                lang_found = False
                for season in show.get("seasons", []):
                    for ep in season.get("episodes", []):
                        if any(l.get("language") == language for l in ep.get("languages", [])):
                            lang_found = True
                            break
                    if lang_found:
                        break
                if not lang_found:
                    continue

            matched_shows.append({**show, "section": sec_name})

    return {"results": matched_shows}