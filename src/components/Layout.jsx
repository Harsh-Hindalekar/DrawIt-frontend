import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <nav style={{ display: "flex", gap: "15px" }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/webcam-drawing">🎨 Webcam Drawing</Link>
          <Link to="/ai-drawing">🤖 AI Drawing</Link>
          <Link to="/flipbook">📖 Flipbook</Link>
          <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
            Logout
          </button>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
