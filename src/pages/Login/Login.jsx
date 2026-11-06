import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "./Login.css";

function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <div className="auth-header-logo">SIMERA</div>
      <a href={linkTo} className="auth-link">{linkText}</a>
    </header>
  );
}

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      setUser({ email: email, name: email.split("@")[0] });
      navigate("/compare");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader linkText="REGISTER" linkTo="/register" />
      
      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Welcome back</h1>

          {apiError && <div className="auth-message">{apiError}</div>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              className={`auth-input ${errors.email ? "auth-input-error" : ""}`} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-bottom">
            <a href="/register" className="auth-bottom-link">No account yet? Register</a>
          </div>
        </form>
      </main>
    </div>
  );
}