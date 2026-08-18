import React, { useState, useEffect } from 'react';
import Viewer from './Viewer';
import { fetchValidationReport, triggerPublish, uploadArtworkFile } from './api';

function CMSDashboard() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [artworkType, setArtworkType] = useState("poster");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await fetchValidationReport();
      setReport(data);
    } catch (err: any) {
      setErrorMsg("Failed to load validation report from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handlePublish = async () => {
    try {
      setPublishMessage("");
      setErrorMsg("");
      const res = await triggerPublish();
      setPublishMessage(res.message);
      loadReport();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Publishing failed.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("artwork_type", artworkType);
    formData.append("file", file);

    try {
      setUploadStatus("Validating and uploading...");
      const res = await uploadArtworkFile(formData);
      setUploadStatus(`Success! Uploaded ${res.artwork_type} (${res.size_kb} KB)`);
      loadReport();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.response?.data?.detail || "Upload validation failed."}`);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem", maxWidth: "900px", margin: "0 auto", background: "#f4f4f9", minHeight: "100vh" }}>
      <h1>Peblo TV — Internal CMS</h1>
      <p style={{ color: "#666" }}>Content editor dashboard for show validation, artwork uploads, and catalog publishing.</p>

      {errorMsg && <div style={{ background: "#ffe6e6", color: "#c00", padding: "1rem", marginBottom: "1rem", borderRadius: "4px" }}>{errorMsg}</div>}
      {publishMessage && <div style={{ background: "#e6ffe6", color: "#060", padding: "1rem", marginBottom: "1rem", borderRadius: "4px" }}>{publishMessage}</div>}

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #ddd" }}>
        <h3>Upload Artwork (Strict Validation & Size Check)</h3>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Specs: Poster (2:3, 600x900) | Banner (16:9, 1280x720) | Thumbnail (16:9, 640x360). Max 200 KB.
        </p>
        <form onSubmit={handleUploadSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5px" }}>Artwork Type:</label>
            <select value={artworkType} onChange={(e) => setArtworkType(e.target.value)} style={{ padding: "0.5rem", width: "100%" }}>
              <option value="poster">Poster (2:3 ~ 600x900px)</option>
              <option value="banner">Banner (16:9 ~ 1280x720px)</option>
              <option value="thumbnail">Thumbnail (16:9 ~ 640x360px)</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5px" }}>Select Image File:</label>
            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/jpeg,image/png" />
          </div>
          <button type="submit" style={{ background: "#007bff", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer" }}>
            Upload & Validate
          </button>
        </form>
        {uploadStatus && <div style={{ marginTop: "1rem", fontWeight: "bold", color: uploadStatus.startsWith("Error") ? "#c00" : "#060" }}>{uploadStatus}</div>}
      </div>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3>Publishing & Validation Report</h3>
          <button onClick={loadReport} style={{ background: "#6c757d", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}>
            Refresh Report
          </button>
        </div>

        {loading ? (
          <p>Loading validation report...</p>
        ) : report ? (
          <div>
            <p><strong>Current Blockers Count:</strong> {report.blockers_count}</p>
            {report.blocking_reports.length > 0 ? (
              <ul style={{ background: "#fff3cd", padding: "1rem 2rem", borderRadius: "4px", border: "1px solid #ffeeba" }}>
                {report.blocking_reports.map((item: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: "0.5rem" }}>
                    <strong>{item.show_title}</strong> (ID: {item.show_id}):
                    <ul>
                      {item.issues.map((issue: string, i: number) => (
                        <li key={i} style={{ color: "#856404" }}>{issue}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#28a745", fontWeight: "bold" }}>No blockers found! Ready to publish.</p>
            )}

            <button 
              onClick={handlePublish}
              disabled={report.blockers_count > 0}
              style={{
                marginTop: "1.5rem",
                background: report.blockers_count > 0 ? "#ccc" : "#28a745",
                color: "#fff",
                border: "none",
                padding: "0.8rem 1.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                cursor: report.blockers_count > 0 ? "not-allowed" : "pointer"
              }}
            >
              Publish Catalog (Atomic)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"cms" | "viewer">("cms");

  return (
    <div>
      <div style={{ background: "#000", padding: "0.8rem 2rem", display: "flex", gap: "1rem", alignItems: "center", borderBottom: "2px solid #333" }}>
        <span style={{ color: "#E50914", fontWeight: "bold", fontSize: "1.2rem", marginRight: "1rem" }}>PEBLO TV PLATFORM</span>
        <button 
          onClick={() => setActiveTab("cms")}
          style={{ background: activeTab === "cms" ? "#E50914" : "#333", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Internal CMS Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("viewer")}
          style={{ background: activeTab === "viewer" ? "#E50914" : "#333", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Netflix Viewer Browse UI
        </button>
      </div>

      {activeTab === "cms" ? <CMSDashboard /> : <Viewer />}
    </div>
  );
}