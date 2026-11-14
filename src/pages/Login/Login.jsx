import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { getCurrentUser, loginUser } from "../../services/authService";
import { describeLoginError } from "../../services/format";
import "./Login.css";

function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <Link to="/" className="auth-header-logo" aria-label="ModelJudge home">ModelJudge</Link>
      <Link to={linkTo} className="auth-link">{linkText}</Link>
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
  const [isSlow, setIsSlow] = useState(false);

  function validate() {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const slowTimer = setTimeout(() => setIsSlow(true), 5000);
    try {
      const data = await loginUser(email.trim(), password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      const account = await getCurrentUser();
      setUser(account);
      navigate("/compare");
    } catch (error) {
      setApiError(describeLoginError(error));
    } finally {
      clearTimeout(slowTimer);
      setIsSlow(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader linkText="REGISTER" linkTo="/register" />

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Welcome back</h1>

          {apiError && <div className="auth-message" role="alert">{apiError}</div>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
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

          {isSlow && (
            <p className="auth-hint" role="status">
              The server is waking up. This can take up to a minute.
            </p>
          )}

          <div className="auth-bottom">
            <Link to="/register" className="auth-bottom-link">No account yet? Register</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
