import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate            = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", form);
      localStorage.setItem("token",   data.token);
      localStorage.setItem("userName", data.name);
      toast.success("Welcome back, " + data.name + "!");
      navigate("/processor");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "#e5e5e5", marginBottom: "0.25rem", fontWeight: 700 }}>
          ⬡ EdgeVision
        </h1>
        <p style={{ color: "#666", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Edge detection powered by OpenCV
        </p>
        <h2 style={{ color: "#ccc", marginBottom: "1.5rem", fontWeight: 500 }}>Sign In</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            required style={inputStyle}
          />
          <input
            name="password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            required style={inputStyle}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ color: "#555", marginTop: "1.5rem", fontSize: "0.88rem", textAlign: "center" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#7c6af7", textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

// Styles
const pageStyle = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", background: "#0a0a0a"
};
const cardStyle = {
  background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px",
  padding: "2.5rem", width: "100%", maxWidth: "400px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)"
};
const inputStyle = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  color: "#e5e5e5", padding: "12px 16px", fontSize: "0.95rem",
  outline: "none", width: "100%", boxSizing: "border-box"
};
const btnStyle = {
  background: "#7c6af7", border: "none", borderRadius: "8px",
  color: "#fff", padding: "12px", fontWeight: 600, fontSize: "0.95rem",
  cursor: "pointer", marginTop: "0.5rem"
};