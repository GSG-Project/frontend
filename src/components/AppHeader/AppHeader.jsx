import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./AppHeader.css";

export default function AppHeader({ user, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user || !user.name) return "UN";
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleSignOutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-logo">SIMERA</div>

      <nav className="header-nav">
        <NavLink
          to="/compare"
          className={`nav-link ${pathname === "/compare" || pathname === "/results" ? "active" : ""}`}
        >
          Compare
        </NavLink>
        <NavLink
          to="/experiments"
          className={`nav-link ${pathname === "/experiments" ? "active" : ""}`}
        >
          Experiments
        </NavLink>
        <NavLink
          to="/configuration"
          className={`nav-link ${pathname === "/configuration" ? "active" : ""}`}
        >
          Configuration
        </NavLink>
      </nav>

      <div className="header-user">
        <div className="user-avatar">{getInitials()}</div>
        <span className="user-name">{user?.name || "User Name"}</span>
        <div className="user-actions">
          <NavLink to="/profile" className="btn-outline">Profile</NavLink>
          <button className="btn-outline" onClick={handleSignOutClick}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}