import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/register", form);
      localStorage.setItem("token",    data.token);
      localStorage.setItem("userName", data.name);
      toast.success("Account created!");
      navigate("/processor");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ ...orb, top: "10%",  right: "20%", width: 300, height: 300, background: "rgba(124,106,247,0.07)" }} />
      <div style={{ ...orb, bottom: "15%", left: "10%", width: 200, height: 200, background: "rgba(91,79,212,0.05)" }} />

      <div style={wrapperStyle}>
        {/* Left panel */}
        <div style={leftPanelStyle}>
          <div style={logoRowStyle}>
            <div style={logoIconStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
                <line x1="12" y1="2"  x2="12" y2="22"/>
                <line x1="2"  y1="8.5"  x2="22" y2="8.5"/>
                <line x1="2"  y1="15.5" x2="22" y2="15.5"/>
              </svg>
            </div>
            <span style={{ color: "#e8e8e8", fontWeight: 700, fontSize: "1.2rem" }}>EdgeVision</span>
          </div>

          <div style={{ marginTop: "auto", marginBottom: "auto" }}>
            <div style={taglineStyle}>Get started free</div>
            <h2 style={{ color: "#e8e8e8", fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.25, margin: "1rem 0 1.25rem", letterSpacing: "-0.03em" }}>
              Start detecting<br />edges today.
            </h2>
            <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 260 }}>
              Create a free account and start processing images with professional-grade computer vision algorithms.
            </p>
          </div>

          <div style={infoBoxStyle}>
            <div style={{ color: "#7c6af7", fontSize: "1.2rem", marginBottom: "6px" }}>⚡</div>
            <div style={{ color: "#e8e8e8", fontSize: "0.85rem", fontWeight: 500, marginBottom: "3px" }}>
              Instant processing
            </div>
            <div style={{ color: "#555", fontSize: "0.8rem", lineHeight: 1.5 }}>
              Results ready in seconds. No queue, no waiting.
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={rightPanelStyle}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ color: "#e8e8e8", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
              Create account
            </h1>
            <p style={{ color: "#555", fontSize: "0.9rem" }}>
              Already have one?{" "}
              <Link to="/login" style={{ color: "#7c6af7", textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                name="name" placeholder="Ayan Ansari"
                value={form.name} onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
                required style={inputStyle(focused === "name")}
              />
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                required style={inputStyle(focused === "email")}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                name="password" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required style={inputStyle(focused === "password")}
              />
              {form.password.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: "3px", borderRadius: "2px",
                        background: form.password.length >= i * 3
                          ? (form.password.length < 6 ? "#e8773a" : "#5cb85c")
                          : "#222",
                        transition: "background 0.2s",
                      }} />
                    ))}
                  </div>
                  <p style={{ color: form.password.length < 6 ? "#e8773a" : "#5cb85c", fontSize: "0.75rem", marginTop: "4px" }}>
                    {form.password.length < 6 ? "Too short" : form.password.length < 10 ? "Good" : "Strong"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={btnStyle}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#6b59e6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#7c6af7"; }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={spinnerStyle} /> Creating account…
                </span>
              ) : "Create account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", background: "#0a0a0a", padding: "1.5rem",
  position: "relative", overflow: "hidden",
};
const orb = {
  position: "absolute", borderRadius: "50%",
  filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
};
const wrapperStyle = {
  display: "flex", width: "100%", maxWidth: "860px",
  background: "#111", border: "1px solid #1e1e1e",
  borderRadius: "20px", overflow: "hidden",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
  position: "relative", zIndex: 1,
};
const leftPanelStyle = {
  width: "320px", flexShrink: 0,
  background: "#0d0d0d", borderRight: "1px solid #1a1a1a",
  padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem",
};
const rightPanelStyle = {
  flex: 1, padding: "2.5rem 3rem",
  display: "flex", flexDirection: "column", justifyContent: "center",
};
const logoRowStyle = { display: "flex", alignItems: "center", gap: "10px" };
const logoIconStyle = {
  width: "36px", height: "36px", borderRadius: "9px",
  background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const taglineStyle = {
  display: "inline-block", fontSize: "0.7rem", fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "#7c6af7", background: "rgba(124,106,247,0.1)",
  border: "1px solid rgba(124,106,247,0.2)",
  padding: "3px 10px", borderRadius: "999px",
};
const infoBoxStyle = {
  background: "#131313", border: "1px solid #1e1e1e",
  borderRadius: "12px", padding: "1rem 1.25rem",
};
const labelStyle = {
  display: "block", fontSize: "0.78rem", fontWeight: 500,
  color: "#555", letterSpacing: "0.05em", textTransform: "uppercase",
  marginBottom: "6px",
};
const inputStyle = (focused) => ({
  width: "100%", background: "#161616",
  border: `1px solid ${focused ? "#7c6af7" : "#242424"}`,
  borderRadius: "10px", color: "#e8e8e8",
  padding: "11px 14px", fontSize: "0.95rem",
  outline: "none", boxSizing: "border-box",
  boxShadow: focused ? "0 0 0 3px rgba(124,106,247,0.12)" : "none",
  transition: "all 0.15s ease",
});
const btnStyle = {
  width: "100%", background: "#7c6af7", border: "none",
  borderRadius: "10px", color: "#fff",
  padding: "12px", fontWeight: 600, fontSize: "0.95rem",
  cursor: "pointer", marginTop: "0.5rem",
  transition: "background 0.15s ease",
};
const spinnerStyle = {
  width: "14px", height: "14px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff", borderRadius: "50%",
  display: "inline-block", animation: "spin 0.7s linear infinite",
};