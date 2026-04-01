import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-hero">
        <h1 className="brand-title">DrawIt</h1>
        <p className="brand-sub">The ultimate platform for drawing and creating smooth flipbook animations directly in your browser.</p>

        <div className="hero-cta">
          <Link to="/login" className="btn primary">Start Creating</Link>
          <Link to="/register" className="btn ghost">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
