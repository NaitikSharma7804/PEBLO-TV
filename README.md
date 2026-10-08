# Peblo TV Mini Platform

## Running Locally

1. **Backend API**:
   ```bash
   pip install -r requirement.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend UI**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Architecture & Implementation Notes

### 1. Atomic Publishing
- **Implementation**: The publish endpoint compiles the entire `catalogue.json` payload in memory, writes it to a temporary file (`catalogue.json.tmp`) in the same volume, and performs an atomic filesystem `os.replace()` over `catalogue.json`.
- **Failure Mode**: If the process crashes mid-write, the temporary file is abandoned, and the existing live `catalogue.json` remains completely untouched. Readers never experience a partially written file.

### 2. Storage Abstraction
- **Implementation**: Uses a `StorageService` interface wrapping `LocalStorageService`.
- **Migration**: To move to Cloudflare R2, implement `R2StorageService` using `boto3` (AWS S3 compatible API). Swapping it requires changing a single dependency injection binding, leaving business logic and validation completely untouched.

### 3. Search & Scaling Limits
- **Implementation**: Implemented as an endpoint querying the pre-published JSON structure across show titles, categories, and episode titles.
- **Scaling Threshold**: Works seamlessly up to a few thousand shows (~5 MB JSON size). Beyond ~10,000 items, parsing the full JSON file on every search request hits CPU and memory bottlenecks.
- **Next Steps**: Index the catalogue into an embedded search engine like Typesense or Meilisearch during the publish job.

### 4. Pre-Published Static Catalogue Architecture
- **Rationale**: Decouples the viewer-facing streaming front-end from the transactional CMS database, guaranteeing sub-millisecond response times, zero database load under heavy streaming traffic, and absolute consistency.
- **Trade-Off**: Introduces a slight publishing delay and makes real-time personalized features harder without auxiliary caching layers.

### 5. Time Spent & Disclosures
- **Time Spent**: ~6 hours total across backend schema design, strict image validation, atomic publishing pipeline, and React CMS/Viewer UI.
- **AI Tools Usage**: AI tools were utilized to assist with boilerplate layout generation and syntax structuring. All architectural decisions, validation constraints, and error-handling flows were manually reviewed and validated.
