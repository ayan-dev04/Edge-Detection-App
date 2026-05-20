import { useState, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL;

const formatBytes = (bytes) => {
  if (!bytes) return "Unknown";
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

// Individual result card component
function ResultImage({ label, folder, filename, token }) {
  const [isHovered, setIsHovered] = useState(false);
  if (!filename) return null;
  const src = `${API}/api/image/${folder}/${filename}`;

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
    <div
      className="result-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(20, 20, 40, 0.6)",
        backdropFilter: "blur(12px)",
        borderRadius: "20px",
        border: `1px solid ${isHovered ? "rgba(124,106,247,0.5)" : "rgba(255,255,255,0.08)"}`,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 20px 35px -10px rgba(0,0,0,0.5)" : "0 10px 20px -5px rgba(0,0,0,0.3)"
      }}
    >
      <div style={{ padding: "1rem 1rem 0.5rem 1rem" }}>
        <span
          style={{
            background: "rgba(124,106,247,0.15)",
            padding: "4px 12px",
            borderRadius: "40px",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#a08eff",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 1", background: "#0a0a0a" }}>
        <img
          src={src}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: isHovered ? "scale(1.03)" : "scale(1)"
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
      <div style={{ padding: "1rem" }}>
        <button
          onClick={download}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "40px",
            color: "white",
            padding: "8px 16px",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,106,247,0.2)";
            e.currentTarget.style.borderColor = "#7c6af7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <span>⬇</span> Download
        </button>
      </div>
    </div>
  );
}

export default function Processor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imageMeta, setImageMeta] = useState(null);
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
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        name: f.name,
        size: formatBytes(f.size),
        dimensions: `${img.width} × ${img.height}`,
        type: f.type.split("/")[1].toUpperCase()
      });
    };
    img.src = url;
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

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setImageMeta(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 30%, #0a0a0a, #0f0f1a)", position: "relative" }}>
      {/* Subtle animated mesh background */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle at 30% 50%, rgba(124,106,247,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,212,255,0.05) 0%, transparent 60%)
        `,
        animation: "bgMove 20s ease infinite"
      }} />
      <Navbar />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem 4rem", position: "relative", zIndex: 2 }}>
        {/* Hero header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{
            background: "rgba(124,106,247,0.15)",
            padding: "4px 16px",
            borderRadius: "40px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#a08eff",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>
            Edge Detection Suite
          </span>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginTop: "0.75rem",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #fff, #a08eff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}>
            Canny & Marr-Hildreth
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "600px", margin: "0 auto" }}>
            Upload an image to detect edges using two classic algorithms.
            Download results instantly.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? "#7c6af7" : "rgba(255,255,255,0.15)"}`,
            borderRadius: "32px",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.25s ease",
            background: dragging ? "rgba(124,106,247,0.05)" : "rgba(20,20,40,0.4)",
            backdropFilter: "blur(12px)",
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
            <div>
              <img
                src={preview}
                alt="preview"
                style={{
                  maxHeight: "300px",
                  maxWidth: "100%",
                  borderRadius: "24px",
                  objectFit: "contain",
                  boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)"
                }}
              />
              {imageMeta && (
                <div style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.5)"
                }}>
                  <span>📄 {imageMeta.name}</span>
                  <span>📐 {imageMeta.dimensions}</span>
                  <span>💾 {imageMeta.size}</span>
                  <span>🖼️ {imageMeta.type}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🖼️</div>
              <p style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Drag & drop your image here
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
                or click to browse (JPG, PNG, BMP, WEBP)
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        {file && !loading && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
            <button
              onClick={processImage}
              style={{
                background: "linear-gradient(135deg, #7c6af7, #5a4ad4)",
                border: "none",
                borderRadius: "40px",
                color: "white",
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 14px rgba(124,106,247,0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(124,106,247,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,106,247,0.3)";
              }}
            >
              ✨ Detect Edges
            </button>
            <button
              onClick={clearAll}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "40px",
                color: "rgba(255,255,255,0.7)",
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
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            background: "rgba(20,20,40,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: "32px",
            padding: "3rem",
            textAlign: "center",
            marginBottom: "2rem"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(124,106,247,0.2)",
              borderTop: "3px solid #7c6af7",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Processing image with edge detection algorithms...</p>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
              This may take a few seconds
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes bgMove {
                0% { transform: translate(0, 0); }
                50% { transform: translate(5%, 5%); }
                100% { transform: translate(0, 0); }
              }
            `}</style>
          </div>
        )}

        {/* Results grid */}
        {results && (
          <div style={{ marginTop: "2rem", animation: "fadeInUp 0.5s ease" }}>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #fff, #a08eff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent"
              }}>
                Detection Results
              </h2>
              <button
                onClick={() => {
                  // Option: download all as zip (advanced)
                  toast.success("Individual downloads available below");
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "40px",
                  padding: "6px 16px",
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                ⬇ Download All
              </button>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem"
            }}>
              <ResultImage label="Original" folder="uploads" filename={results.original} token={token} />
              <ResultImage label="Canny Edge" folder="results" filename={results.canny_edges} token={token} />
              <ResultImage label="Canny Enhanced" folder="results" filename={results.canny_output} token={token} />
              <ResultImage label="LoG Edge" folder="results" filename={results.marr_edges} token={token} />
              <ResultImage label="LoG Enhanced" folder="results" filename={results.marr_output} token={token} />
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}