# Product Roadmap

## Phase 1: Core Foundation
- Relational schema modeling with SQLAlchemy.
- Fast static catalogue generation.

## Phase 2: Media Management
- Strict dimension and aspect ratio validation.
- Support for poster, banner, and thumbnail assets.

## Phase 3: Search Engine Integration
- Integrate embedded search engine (Meilisearch or Typesense) during catalog publishing pipeline.
- Support fuzzy typo tolerance and weighted attribute queries.

## Phase 4: Edge CDN & Caching
- Distribute `catalogue.json` across Cloudflare CDN nodes with cache tags and instant invalidation.
