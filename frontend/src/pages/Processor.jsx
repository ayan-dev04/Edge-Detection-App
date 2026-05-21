import { useState, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const API = "https://edge-detection-app-wslz.onrender.com";

function ResultCard({ label, folder, filename, token, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);
  if (!filename) return null;

  const src = `${API}/api/image/${folder}/${filename}`;

  const download = () => {
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Download failed");
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${label.replace(/ /g, "_")}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => toast.error("Download failed"));
  };

  const colors = ["#7c6af7", "#5b9cf7", "#f7916a", "#6af7c8", "#f7d06a"];
  const accent = colors[index % colors.length];

  return (
    <div
      style={resultCardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent + "44";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#1e1e1e";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, flexShrink: 0 }} />
          <span style={{ color: "#888", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {label}
          </span>
        </div>
        <button
          onClick={download}
          style={{ ...dlBtnStyle, color: accent, borderColor: accent + "33" }}
          onMouseEnter={e => { e.currentTarget.style.background = accent + "14"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          ↓ Save
        </button>
      </div>

      {/* Image */}
      <div style={{ borderRadius: "8px", overflow: "hidden", background: "#0d0d0d", lineHeight: 0, minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!imgLoaded && !imgError && (
          <div style={{ padding: "2rem", color: "#444", fontSize: "0.8rem" }}>Loading…</div>
        )}
        {imgError && (
          <div style={{ padding: "2rem", color: "#555", fontSize: "0.8rem" }}>Could not load image</div>
        )}
        <img
          src={src}
          alt={label}
          style={{ width: "100%", display: imgLoaded ? "block" : "none", borderRadius: "8px" }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      </div>
    </div>
  );
}

function StepBadge({ num, label, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.75rem", fontWeight: 700,
        background: done ? "#7c6af7" : active ? "rgba(124,106,247,0.15)" : "#161616",
        color: done ? "#fff" : active ? "#7c6af7" : "#444",
        border: `1px solid ${done ? "#7c6af7" : active ? "rgba(124,106,247,0.4)" : "#242424"}`,
        transition: "all 0.2s",
      }}>
        {done ? "✓" : num}
      </div>
      <span style={{ fontSize: "0.85rem", color: active || done ? "#e8e8e8" : "#444", fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
    </div>
  );
}

export default function Processor() {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef();
  const token    = localStorage.getItem("token");
  const step     = !file ? 1 : !results ? 2 : 3;

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/bmp", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Please upload a JPG, PNG, BMP or WEBP image.");
      return;
    }
    if (f.size > 16 * 1024 * 1024) {
      toast.error("File too large. Max size is 16 MB.");
      return;
    }
    setFile(f);
    setResults(null);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processImage = async () => {
    if (!file) return;
    setLoading(true);
    setProgress("Uploading image…");
    const fd = new FormData();
    fd.append("image", file);
    try {
      setProgress("Running edge detection…");
      const { data } = await api.post("/api/process", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      setProgress("Loading results…");
      setResults(data);
      toast.success("Processing complete!");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Processing failed";
      toast.error(msg);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setProgress("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>

          {/* Sidebar */}
          <div style={sidebarStyle}>
            <div style={sideCardStyle}>
              <p style={{ color: "#555", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                Workflow
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <StepBadge num="1" label="Upload image"     active={step === 1} done={step > 1} />
                <StepBadge num="2" label="Detect edges"     active={step === 2} done={step > 2} />
                <StepBadge num="3" label="Download results" active={step === 3} done={false} />
              </div>
            </div>

            <div style={sideCardStyle}>
              <p style={{ color: "#555", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                Algorithms
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={algoCardStyle("#7c6af7")}>
                  <div style={{ color: "#7c6af7", fontWeight: 600, fontSize: "0.85rem", marginBottom: "3px" }}>Canny</div>
                  <div style={{ color: "#555", fontSize: "0.78rem", lineHeight: 1.5 }}>Multi-stage algorithm. Sharp, clean edges with low noise.</div>
                </div>
                <div style={algoCardStyle("#5b9cf7")}>
                  <div style={{ color: "#5b9cf7", fontWeight: 600, fontSize: "0.85rem", marginBottom: "3px" }}>Marr-Hildreth</div>
                  <div style={{ color: "#555", fontSize: "0.78rem", lineHeight: 1.5 }}>LoG filter. Softer edges, captures fine detail.</div>
                </div>
              </div>
            </div>

            <div style={sideCardStyle}>
              <p style={{ color: "#555", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Accepted formats
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["JPG", "PNG", "BMP", "WEBP"].map(f => (
                  <span key={f} style={formatBadgeStyle}>{f}</span>
                ))}
              </div>
              <p style={{ color: "#444", fontSize: "0.78rem", marginTop: "0.75rem" }}>Max size: 16 MB</p>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.4rem" }}>
                <h2 style={{ color: "#e8e8e8", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Edge Detection
                </h2>
                {results && (
                  <span style={{ ...formatBadgeStyle, color: "#5cb85c", borderColor: "#5cb85c44", background: "#5cb85c11", fontSize: "0.72rem" }}>
                    ✓ Complete
                  </span>
                )}
              </div>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>
                Upload an image to run Canny and Marr-Hildreth edge detection.
              </p>
            </div>

            {/* Upload zone */}
            <div
              onClick={() => !preview && inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragging ? "#7c6af7" : preview ? "#2a2a2a" : "#1e1e1e"}`,
                borderRadius: "14px",
                padding: preview ? "1rem" : "3.5rem 2rem",
                textAlign: "center",
                cursor: preview ? "default" : "pointer",
                transition: "all 0.2s",
                background: dragging ? "rgba(124,106,247,0.04)" : "#111",
                marginBottom: "1.25rem",
              }}
            >
              <input
                ref={inputRef} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <div>
                  <img
                    src={preview} alt="preview"
                    style={{ maxHeight: "320px", maxWidth: "100%", borderRadius: "10px", objectFit: "contain", display: "block", margin: "0 auto" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "1rem" }}>
                    <span style={{ color: "#555", fontSize: "0.82rem" }}>{file?.name}</span>
                    <span style={{ color: "#333" }}>·</span>
                    <span style={{ color: "#555", fontSize: "0.82rem" }}>{(file?.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "0.82rem" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#161616", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p style={{ color: "#777", fontSize: "0.95rem", marginBottom: "0.4rem", fontWeight: 500 }}>
                    Drop your image here
                  </p>
                  <p style={{ color: "#444", fontSize: "0.82rem" }}>
                    or <span style={{ color: "#7c6af7" }}>click to browse</span> — JPG, PNG, BMP, WEBP
                  </p>
                </>
              )}
            </div>

            {/* Action buttons */}
            {file && !loading && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "2rem" }}>
                <button
                  onClick={processImage}
                  style={primaryBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = "#6b59e6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#7c6af7"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Run edge detection
                </button>
                <button
                  onClick={reset}
                  style={ghostBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#e8e8e8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666"; }}
                >
                  Clear
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div style={loadingBoxStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={bigSpinnerStyle} />
                  <div>
                    <div style={{ color: "#e8e8e8", fontWeight: 500, fontSize: "0.95rem" }}>{progress || "Processing…"}</div>
                    <div style={{ color: "#555", fontSize: "0.82rem", marginTop: "2px" }}>This may take 10–30 seconds on first run</div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h3 style={{ color: "#e8e8e8", fontWeight: 600, fontSize: "1rem" }}>
                    Results <span style={{ color: "#444", fontWeight: 400 }}>— 5 images</span>
                  </h3>
                  <button
                    onClick={reset}
                    style={{ ...ghostBtnStyle, padding: "6px 14px", fontSize: "0.82rem" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#e8e8e8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666"; }}
                  >
                    Process another
                  </button>
                </div>
                <div style={resultsGridStyle}>
                  <ResultCard index={0} label="Original Image"                  folder="uploads" filename={results.original}     token={token} />
                  <ResultCard index={1} label="Canny — Edge Map"                folder="results" filename={results.canny_edges}  token={token} />
                  <ResultCard index={2} label="Canny — Enhanced Output"         folder="results" filename={results.canny_output} token={token} />
                  <ResultCard index={3} label="Marr-Hildreth — Edge Map"        folder="results" filename={results.marr_edges}   token={token} />
                  <ResultCard index={4} label="Marr-Hildreth — Enhanced Output" folder="results" filename={results.marr_output}  token={token} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Styles
const sidebarStyle  = { width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem" };
const sideCardStyle = { background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.25rem" };
const algoCardStyle = (color) => ({ background: "#0d0d0d", border: `1px solid ${color}22`, borderRadius: "8px", padding: "10px 12px" });
const formatBadgeStyle = { fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", color: "#555", background: "#161616", border: "1px solid #222", padding: "3px 8px", borderRadius: "5px" };
const primaryBtnStyle  = { display: "inline-flex", alignItems: "center", gap: "8px", background: "#7c6af7", border: "none", borderRadius: "10px", color: "#fff", padding: "11px 22px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s ease" };
const ghostBtnStyle    = { background: "transparent", border: "1px solid #242424", borderRadius: "10px", color: "#666", padding: "11px 18px", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s ease" };
const loadingBoxStyle  = { background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" };
const bigSpinnerStyle  = { width: "20px", height: "20px", flexShrink: 0, border: "2px solid #2a2a2a", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "spin 0.7s linear infinite" };
const resultCardStyle  = { background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1rem", transition: "all 0.2s ease" };
const resultsGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" };
const dlBtnStyle       = { background: "transparent", border: "1px solid", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "background 0.15s", flexShrink: 0 };