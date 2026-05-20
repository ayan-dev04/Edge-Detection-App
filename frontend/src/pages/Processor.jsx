import { useState, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000/api";

function ResultImage({ label, folder, filename, token }) {
  if (!filename) return null;
  const src = `${API}/image/${folder}/${filename}`;

  const download = () => {
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${label.replace(/ /g, "_")}.png`;
        a.click();
      });
  };

  return (
    <div className="result-card" style={{
      background: "rgba(17,17,17,0.7)",
      backdropFilter: "blur(8px)",
      borderRadius: "16px",
      padding: "1rem",
      border: "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.2s, box-shadow 0.2s"
    }}>
      <p style={{
        color: "var(--text-secondary)",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "0.5rem"
      }}>
        {label}
      </p>
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          borderRadius: "12px",
          display: "block",
          aspectRatio: "1 / 1",
          objectFit: "cover",
          background: "#0a0a0a"
        }}
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <button
        onClick={download}
        className="download-btn"
        style={{
          marginTop: "0.75rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          color: "var(--text-secondary)",
          padding: "8px 12px",
          fontSize: "0.8rem",
          width: "100%",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(124,106,247,0.1)";
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        ↓ Download
      </button>
    </div>
  );
}

 export default function Processor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const token = localStorage.getItem("token");

  const handleFile = (f) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/bmp", "image/webp"].includes(f.type)) {
      toast.error("Please upload a JPG, PNG, BMP or WEBP image.");
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
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await api.post("/process", fd);
      setResults(data);
      toast.success("Processing complete!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{
            fontSize: "2.2rem",
            background: "linear-gradient(135deg, #fff, var(--accent))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            Edge Detection
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Upload an image to detect edges using Canny and Marr-Hildreth (LoG) algorithms.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? "var(--accent)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: "24px",
            padding: "2.5rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.25s",
            background: dragging ? "rgba(124,106,247,0.03)" : "rgba(17,17,17,0.5)",
            backdropFilter: "blur(8px)",
            marginBottom: "2rem"
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{
                maxHeight: "280px",
                maxWidth: "100%",
                borderRadius: "16px",
                objectFit: "contain",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.8 }}>🖼️</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                Click or drag & drop an image here
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                JPG, PNG, BMP, WEBP — max 16 MB
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        {file && !loading && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem" }}>
            <button
              onClick={processImage}
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                border: "none",
                borderRadius: "40px",
                color: "white",
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124,106,247,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,106,247,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,106,247,0.3)";
              }}
            >
              ✨ Detect Edges
            </button>
            <button
              onClick={() => { setFile(null); setPreview(null); setResults(null); }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "40px",
                color: "var(--text-secondary)",
                padding: "12px 28px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "3rem",
            background: "rgba(17,17,17,0.5)",
            borderRadius: "24px",
            backdropFilter: "blur(8px)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border)",
              borderTop: "3px solid var(--accent)",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: "var(--text-secondary)" }}>Processing image… please wait</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Results grid */}
        {results && (
          <div style={{ marginTop: "2rem", animation: "fadeInUp 0.4s ease" }}>
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              color: "var(--text-primary)",
              borderLeft: `3px solid var(--accent)`,
              paddingLeft: "1rem"
            }}>
              Detection Results
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem"
            }}>
              <ResultImage label="Original" folder="uploads" filename={results.original} token={token} />
              <ResultImage label="Canny Edge Map" folder="results" filename={results.canny_edges} token={token} />
              <ResultImage label="Canny Enhanced" folder="results" filename={results.canny_output} token={token} />
              <ResultImage label="Marr-Hildreth Edge" folder="results" filename={results.marr_edges} token={token} />
              <ResultImage label="Marr-Hildreth Enhanced" folder="results" filename={results.marr_output} token={token} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}