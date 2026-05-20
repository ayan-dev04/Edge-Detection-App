import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
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
      localStorage.setItem("token", data.token);
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
    <div className="auth-page">
      <div className="glass-auth-card">
        <h1 style={{ textAlign: "center" }}>⬡ EdgeVision</h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>
          Create your account
        </p>
        <h2 style={{ textAlign: "center" }}>Register</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            placeholder="Password (min. 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "rgba(255,255,255,0.6)" }}>
          Already have an account?{" "}
          <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}