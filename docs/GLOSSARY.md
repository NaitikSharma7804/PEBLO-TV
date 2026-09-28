# Domain Glossary

- **Show**: Top-level entity representing a television series, minisodes, or music collection.
- **Season**: Ordered collection of episodes within a show. Season 0 represents promotional trailers.
- **Episode**: Individual video item containing duration, video stream URL, and language metadata.
- **Content Group**: Logical grouping identifier used to collapse localized audio/subtitle variants.
- **Static Catalogue**: Pre-compiled JSON file containing all published shows and collapsed language variants.
- **Publish Run**: Audit record logging catalogue build outcome, trigger source, and content counts.

## Artwork Types
- **Poster**: Vertical show thumbnail with 2:3 aspect ratio (target 600x900).
- **Banner**: Wide horizontal hero graphic with 16:9 aspect ratio (target 1280x720).
- **Thumbnail**: Compact landscape preview with 16:9 aspect ratio (target 640x360).

## Sections
- `featured`: Curated hero carousel content.
- `series`: Multi-season narrative series.
- `minisodes`: Short-form episodic video.
- `songs`: Dedicated audio-visual track listings.
