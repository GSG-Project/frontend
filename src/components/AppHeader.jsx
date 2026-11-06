import { NavLink, useLocation } from "react-router-dom";

export default function AppHeader() {
  const { pathname } = useLocation();

  const isCompareActive =
    pathname === "/compare" || pathname === "/results";

  return (
    <header className="app-header">
      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          height: 60px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #E5E7EB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .header-logo {
          font-weight: bold;
          font-size: 1.2rem;
          letter-spacing: 1px;
          color: #171426;
        }

        .header-nav {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          text-decoration: none;
          color: #171426;
          font-weight: 500;
          padding-bottom: 4px;
          font-size: 0.9rem;
        }

        .nav-link.active {
          color: #6D4AFF;
          border-bottom: 2px solid #6D4AFF;
        }

        .nav-link.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
        }

        .user-avatar {
          background-color: #6D4AFF;
          color: #FFFFFF;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .user-name {
          color: #171426;
          font-weight: 500;
        }

        .user-actions {
          display: flex;
          gap: 8px;
          margin-left: 8px;
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid #E5E7EB;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          color: #171426;
          font-size: 0.8rem;
        }
      `}</style>

      <div className="header-logo">SIMERA</div>

      <nav className="header-nav">
        <NavLink
          to="/compare"
          className={`nav-link ${isCompareActive ? "active" : ""}`}
        >
          Compare
        </NavLink>

        <span className="nav-link disabled" aria-disabled="true">
          Experiments
        </span>

        <span className="nav-link disabled" aria-disabled="true">
          Configuration
        </span>
      </nav>

      <div className="header-user">
        <div className="user-avatar">UN</div>

        <span className="user-name">User Name</span>

        <div className="user-actions">
          <button className="btn-outline">Profile</button>
          <button className="btn-outline">Sign Out</button>
        </div>
      </div>
    </header>
  );
}