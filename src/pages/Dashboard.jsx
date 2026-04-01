import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../utils/api";
import "./Dashboard.css";

import airImg from "../assets/air1.png";
import smartImg from "../assets/smart.png";
import flipImg from "../assets/flip.png";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getProfile();

        if (res?.email) {
          setUser(res);
        } else {
          throw new Error("Invalid token");
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="ds-brand">DrawIt</div>
        <nav className="ds-nav">
          <Link to="/dashboard" className="ds-link active">Dashboard</Link>
          <Link to="/webcam-drawing" className="ds-link">New Drawing</Link>
          <Link to="/flipbook" className="ds-link">New Flipbook</Link>
          <Link to="/ai-drawing" className="ds-link">AI Drawing</Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dm-header">
          <h1>Welcome back, Artist!</h1>
          <p className="dm-sub">Ready to create your next masterpiece?</p>
        </header>

        <section className="dm-cards">
          <Link to="/webcam-drawing" className="dm-card">
            <div className="dm-icon"><img src={airImg} alt="Air"/></div>
            <h3>New Drawing</h3>
            <p>Start with a blank canvas</p>
          </Link>

          <Link to="/flipbook" className="dm-card">
            <div className="dm-icon"><img src={flipImg} alt="Flip"/></div>
            <h3>New Flipbook</h3>
            <p>Create frame-by-frame animation</p>
          </Link>

          <Link to="/ai-drawing" className="dm-card">
            <div className="dm-icon"><img src={smartImg} alt="AI"/></div>
            <h3>AI Drawing</h3>
            <p>Draw with auto-shapes & AI</p>
          </Link>
        </section>


      </main>
    </div>
  );
}
