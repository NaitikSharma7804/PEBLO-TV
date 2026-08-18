import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

export default function Viewer() {
  const [catalog, setCatalog] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/catalog`);
      setCatalog(res.data);
    } catch (err) {
      console.error("Failed to load catalog. Make sure you published it from the CMS!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery && !selectedCategory && !selectedLanguage) {
      setSearchResults(null);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedLanguage) params.append("language", selectedLanguage);

      const res = await axios.get(`${API_BASE}/catalog/search?${params.toString()}`);
      setSearchResults(res.data.results);
    } catch (err) {
      console.error("Search failed");
    }
  };

  const getArtwork = (artworks: any[], type: string) => {
    const found = artworks?.find(a => a.type === type);
    return found ? `${API_BASE}/${found.path}` : "https://via.placeholder.com/300x450?text=No+Artwork";
  };

  if (loading) return <div style={{ background: "#111", color: "#fff", minHeight: "100vh", padding: "2rem" }}>Loading Peblo TV...</div>;

  return (
    <div style={{ background: "#111", color: "#fff", minHeight: "100vh", fontFamily: "Arial, sans-serif", paddingBottom: "3rem" }}>
      {/* HEADER / NAVBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 3rem", background: "#000" }}>
        <h2 style={{ color: "#E50914", margin: 0 }}>PEBLO TV</h2>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
          <input 
            type="text" 
            placeholder="Search shows, episodes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "none", width: "250px" }}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", background: "#333", color: "#fff", border: "none" }}
          >
            <option value="">All Categories</option>
            <option value="adventure">Adventure</option>
            <option value="learning">Learning</option>
            <option value="science">Science</option>
            <option value="stories">Stories</option>
          </select>
          <button type="submit" style={{ background: "#E50914", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>Search</button>
        </form>
      </div>

      {/* SHOW DETAIL MODAL */}
      {selectedShow && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#222", padding: "2rem", borderRadius: "8px", maxWidth: "600px", width: "90%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setSelectedShow(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "#E50914", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>Close</button>
            <h2>{selectedShow.title}</h2>
            <p style={{ color: "#aaa" }}>{selectedShow.synopsis}</p>
            <p><strong>Category:</strong> {selectedShow.category}</p>

            <h3 style={{ marginTop: "1.5rem" }}>Seasons & Episodes</h3>
            {selectedShow.seasons?.map((season: any) => (
              <div key={season.season_number} style={{ marginBottom: "1rem", background: "#333", padding: "1rem", borderRadius: "4px" }}>
                <h4>Season {season.season_number}: {season.title || "Main Episodes"}</h4>
                {season.episodes.map((ep: any) => (
                  <div key={ep.content_group} style={{ borderTop: "1px solid #444", paddingTop: "0.5kt", marginTop: "0.5rem" }}>
                    <p style={{ margin: "0.2rem 0" }}><strong>Ep {ep.episode_number}:</strong> {ep.title} ({Math.round(ep.duration_seconds / 60)} mins)</p>
                    <p style={{ fontSize: "0.85rem", color: "#ccc", margin: "0.2rem 0" }}>
                      Available Languages: {ep.languages.map((l: any) => l.language.toUpperCase()).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH RESULTS VIEW OR NETFLIX HOME */}
      {searchResults ? (
        <div style={{ padding: "2rem 3rem" }}>
          <h2>Search Results ({searchResults.length})</h2>
          <button onClick={() => setSearchResults(null)} style={{ background: "#444", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", marginBottom: "1rem" }}>Clear Search</button>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {searchResults.map((show: any) => (
              <div key={show.id} onClick={() => setSelectedShow(show)} style={{ width: "200px", cursor: "pointer", background: "#222", borderRadius: "4px", overflow: "hidden" }}>
                <img src={getArtwork(show.artworks, "poster")} alt={show.title} style={{ width: "100%", height: "300px", objectFit: "cover" }} />
                <div style={{ padding: "0.8rem" }}>
                  <h4 style={{ margin: "0 0 0.4rem 0", fontSize: "1rem" }}>{show.title}</h4>
                  <span style={{ fontSize: "0.8rem", background: "#333", padding: "0.2rem 0.4rem", borderRadius: "3px" }}>{show.category}</span>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && <p>No shows matched your filter criteria.</p>}
          </div>
        </div>
      ) : catalog?.sections ? (
        <div>
          {/* FEATURED HERO BANNER */}
          {catalog.sections.featured?.[0] && (
            <div style={{ position: "relative", height: "450px", backgroundImage: `url(${getArtwork(catalog.sections.featured[0].artworks, "banner")})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "flex-end", padding: "3rem" }}>
              <div style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", width: "100%", position: "absolute", bottom: 0, left: 0, padding: "3rem" }}>
                <h1 style={{ fontSize: "3rem", margin: "0 0 0.5rem 0" }}>{catalog.sections.featured[0].title}</h1>
                <p style={{ maxWidth: "600px", color: "#ddd", marginBottom: "1rem" }}>{catalog.sections.featured[0].synopsis}</p>
                <button onClick={() => setSelectedShow(catalog.sections.featured[0])} style={{ background: "#fff", color: "#000", border: "none", padding: "0.6rem 1.5rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer" }}>View Details</button>
              </div>
            </div>
          )}

          {/* SECTION ROWS */}
          {Object.entries(catalog.sections).map(([secName, shows]: [string, any]) => (
            shows.length > 0 && (
              <div key={secName} style={{ padding: "1.5rem 3rem" }}>
                <h3 style={{ textTransform: "capitalize", marginBottom: "1rem" }}>{secName}</h3>
                <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                  {shows.map((show: any) => (
                    <div key={show.id} onClick={() => setSelectedShow(show)} style={{ minWidth: "180px", width: "180px", cursor: "pointer", background: "#222", borderRadius: "4px", overflow: "hidden", flexShrink: 0, transition: "transform 0.2s" }}>
                      <img src={getArtwork(show.artworks, "poster")} alt={show.title} style={{ width: "100%", height: "260px", objectFit: "cover" }} />
                      <div style={{ padding: "0.6rem" }}>
                        <h5 style={{ margin: 0, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{show.title}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <h2>No catalog published yet!</h2>
          <p>Head over to the CMS dashboard to publish your shows.</p>
        </div>
      )}
    </div>
  );
}