import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/authService";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Compare from "./pages/Compare/Compare";
import ComparisonResults from "./pages/ComparisonResults/ComparisonResults";
import Profile from "./pages/Profile/Profile";
import Experiments from "./pages/Experiments/Experiments";
import Configuration from "./pages/Configuration/Configuration";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("accessToken");

      if (token) {
        const savedUserData = localStorage.getItem("userData");

        if (savedUserData) {
          try {
            setUser(JSON.parse(savedUserData));
            setIsLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem("userData");
          }
        }

        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setIsLoading(false);
    }
    checkAuth();
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        <Route path="/compare" element={<Compare user={user} onLogout={handleLogout} />} />
        <Route path="/results" element={<ComparisonResults user={user} onLogout={handleLogout} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} onLogout={handleLogout} />} />

        <Route path="/experiments" element={<Experiments user={user} onLogout={handleLogout} />} />
        <Route path="/configuration" element={<Configuration user={user} onLogout={handleLogout} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;