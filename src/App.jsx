import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/authService";
import { SESSION_EXPIRED_EVENT } from "./services/api";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Compare from "./pages/Compare/Compare";
import ComparisonResults from "./pages/ComparisonResults/ComparisonResults";
import Profile from "./pages/Profile/Profile";
import Experiments from "./pages/Experiments/Experiments";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ExperimentDetails from "./pages/ExperimentDetails/ExperimentDetails";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("accessToken");

      localStorage.removeItem("userData");

      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          if (error.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing user={user} />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        <Route path="/compare" element={<Compare user={user} onLogout={handleLogout} />} />
        <Route path="/results" element={<ComparisonResults user={user} onLogout={handleLogout} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} onLogout={handleLogout} />} />

        <Route path="/experiments" element={<Experiments user={user} onLogout={handleLogout} />} />
        <Route path="/experiments/:experimentId" element={<ExperimentDetails user={user} onLogout={handleLogout} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
