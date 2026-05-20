import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("userName") || "User";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 2rem", height: "60px",
      background: "#0f0f0f", borderBottom: "1px solid #222"
    }}>
      <span style={{ color: "#e5e5e5", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.05em" }}>
        ⬡ EdgeVision
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <span style={{ color: "#888", fontSize: "0.9rem" }}>
          Hi, {name}
        </span>
        <button onClick={logout} style={{
          background: "transparent", border: "1px solid #333",
          color: "#aaa", padding: "6px 16px", borderRadius: "6px",
          cursor: "pointer", fontSize: "0.85rem"
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}