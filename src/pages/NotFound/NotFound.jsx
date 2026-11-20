import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page not found - ModelJudge";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <Link to="/" className="not-found-brand">ModelJudge</Link>
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1 className="not-found-title">This page doesn't exist</h1>
        <p className="not-found-text">
          The link may be broken or the page may have moved. You can head back home or start a new comparison.
        </p>
        <div className="not-found-actions">
          <Link to="/compare" className="not-found-btn not-found-btn-primary">Start a comparison</Link>
          <Link to="/" className="not-found-btn">Go to home</Link>
        </div>
      </div>
    </main>
  );
}
