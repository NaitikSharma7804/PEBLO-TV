from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    synopsis = Column(Text, nullable=True)
    section = Column(String(50), nullable=False, index=True)  # featured, series, minisodes, songs
    category = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="draft", nullable=False, index=True)  # draft, published
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    seasons = relationship("Season", back_populates="show", cascade="all, delete-orphan")
    artworks = relationship("Artwork", back_populates="show", cascade="all, delete-orphan")


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id", ondelete="CASCADE"), nullable=False)
    season_number = Column(Integer, nullable=False)  # 0 is reserved for trailers
    title = Column(String(255), nullable=True)

    show = relationship("Show", back_populates="seasons")
    episodes = relationship("Episode", back_populates="season", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("show_id", "season_number", name="uq_show_season_number"),
    )


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    episode_number = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=True)  # Required for publishing
    language = Column(String(10), nullable=False, index=True)
    content_group = Column(String(100), nullable=False, index=True)
    video_url = Column(String(508), nullable=True)
    
    season = relationship("Season", back_populates="episodes")
    artworks = relationship("Artwork", back_populates="episode", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("content_group", "language", name="uq_content_group_language"),
    )


class Artwork(Base):
    __tablename__ = "artworks"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id", ondelete="CASCADE"), nullable=True)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=True)
    artwork_type = Column(String(20), nullable=False)  # poster, banner, thumbnail
    file_path = Column(String(512), nullable=False)
    file_size_kb = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    show = relationship("Show", back_populates="artworks")
    episode = relationship("Episode", back_populates="artworks")


class PublishRun(Base):
    __tablename__ = "publish_runs"

    id = Column(Integer, primary_key=True, index=True)
    triggered_by = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)  # success, failed
    shows_count = Column(Integer, nullable=False)
    episodes_count = Column(Integer, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)