import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { formatUserName, getUserInitials } from "../../services/format";
import "./AppHeader.css";

const MOBILE_QUERY = "(max-width: 640px)";
const TABLET_QUERY = "(min-width: 641px) and (max-width: 1024px)";

const SIDEBAR_STORAGE_KEY = "modeljudge.sidebarCollapsed";
const SWIPE_CLOSE_DISTANCE = 64;

function subscribeToLayout(onChange) {
  const queries = [window.matchMedia(MOBILE_QUERY), window.matchMedia(TABLET_QUERY)];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function readLayout() {
  if (window.matchMedia(MOBILE_QUERY).matches) return "mobile";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  return "desktop";
}

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveCollapsedPreference(collapsed) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
  }
}

export default function AppHeader({ user, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const layout = useSyncExternalStore(subscribeToLayout, readLayout, () => "desktop");
  const isMobile = layout === "mobile";
  const isTablet = layout === "tablet";

  const [tabletCollapsed, setTabletCollapsed] = useState(readCollapsedPreference);
  const [animateLayout, setAnimateLayout] = useState(false);

  const [drawerOpenOnPath, setDrawerOpenOnPath] = useState(null);
  if (!isMobile && drawerOpenOnPath !== null) setDrawerOpenOnPath(null);
  const isDrawerOpen = isMobile && drawerOpenOnPath === pathname;

  const sidebarVisible = (isTablet && !tabletCollapsed) || isDrawerOpen;

  const [dragOffset, setDragOffset] = useState(0);
  const touchStartRef = useRef(null);

  const toggleRef = useRef(null);
  const sidebarRef = useRef(null);

  const closeDrawer = () => {
    setDrawerOpenOnPath(null);
    setDragOffset(0);
  };

  const handleToggle = () => {
    if (isTablet) {
      const next = !tabletCollapsed;
      setAnimateLayout(true);
      setTabletCollapsed(next);
      saveCollapsedPreference(next);
    } else if (isMobile) {
      setDrawerOpenOnPath(isDrawerOpen ? null : pathname);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    sidebarRef.current?.querySelector("a")?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpenOnPath(null);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const handleTouchStart = (event) => {
    if (!isDrawerOpen) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, horizontal: null };
  };

  const handleTouchMove = (event) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = event.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (start.horizontal === null && Math.abs(dx) + Math.abs(dy) > 8) {
      start.horizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (start.horizontal) setDragOffset(Math.min(0, dx));
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (start?.horizontal && dragOffset <= -SWIPE_CLOSE_DISTANCE) closeDrawer();
    else setDragOffset(0);
  };

  const getInitials = () => getUserInitials(user);
  const displayName = formatUserName(user);

  const handleSignOutClick = () => {
    closeDrawer();
    onLogout();
    navigate("/login");
  };

  const navItems = [
    { to: "/compare", label: "Compare", active: pathname === "/compare" || pathname === "/results" },
    { to: "/experiments", label: "History", active: pathname.startsWith("/experiments") },
  ];

  const renderLinks = (onNavigate) =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={`nav-link ${item.active ? "active" : ""}`}
        aria-current={item.active ? "page" : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </NavLink>
    ));

  const sidebarClasses = [
    "app-sidebar",
    isTablet && !tabletCollapsed ? "is-expanded" : "",
    isDrawerOpen ? "is-open" : "",
    dragOffset ? "is-dragging" : "",
    animateLayout ? "animate-layout" : "",
  ].join(" ");

  return (
    <>
      {/* Top bar */}
      <header className={`app-header ${isTablet && !tabletCollapsed ? "sidebar-expanded" : ""}`}>
        <div className="header-start">
          <button
            ref={toggleRef}
            type="button"
            className="sidebar-toggle"
            aria-controls="app-sidebar"
            aria-expanded={sidebarVisible}
            aria-label={
              isTablet
                ? tabletCollapsed ? "Expand navigation" : "Collapse navigation"
                : "Open navigation"
            }
            onClick={handleToggle}
          >
            <span className="sidebar-toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          <Link to="/" className="header-logo" aria-label="ModelJudge home">ModelJudge</Link>
        </div>

        <nav className="header-nav" aria-label="Main">
          {renderLinks()}
        </nav>

        <div className="header-user">
          <div className="user-avatar">{getInitials()}</div>
          <span className="user-name">{displayName}</span>
          <div className="user-actions">
            <NavLink to="/profile" className="btn-outline">Profile</NavLink>
            <button type="button" className="btn-outline" onClick={handleSignOutClick}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Side navigation */}
      <div
        className={`sidebar-backdrop ${isDrawerOpen ? "is-visible" : ""}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={sidebarClasses}
        aria-label="Navigation"
        inert={sidebarVisible ? undefined : true}
        style={dragOffset ? { transform: `translateX(${dragOffset}px)` } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Link to="/" className="sidebar-brand" aria-label="ModelJudge home">ModelJudge</Link>

        <nav className="sidebar-nav" aria-label="Main">
          {renderLinks(isMobile ? closeDrawer : undefined)}
        </nav>

        <div className="sidebar-account">
          <div className="sidebar-user">
            <div className="user-avatar">{getInitials()}</div>
            <span className="sidebar-user-name">{displayName}</span>
          </div>
          <NavLink to="/profile" className="btn-outline" onClick={isMobile ? closeDrawer : undefined}>
            Profile
          </NavLink>
          <button type="button" className="btn-outline" onClick={handleSignOutClick}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
