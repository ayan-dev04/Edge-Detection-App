import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";   // <-- import the configured axios instance
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the api instance – baseURL is already set
      const { data } = await api.post("/api/login", form);   // note the /api prefix
      localStorage.setItem("token", data.token);
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
    <div className="auth-page">
      <div className="glass-auth-card">
        <h1 style={{ textAlign: "center" }}>⬡ EdgeVision</h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>
          Advanced Edge Detection
        </p>
        <h2 style={{ textAlign: "center" }}>Sign In</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "rgba(255,255,255,0.6)" }}>
          No account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}