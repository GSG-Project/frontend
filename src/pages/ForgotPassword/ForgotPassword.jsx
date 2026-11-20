import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";
import { describeGeneralError } from "../../services/format";
import "../Login/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const value = email.trim();
    if (!value || !value.includes("@") || !value.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      await requestPasswordReset(value);
      setSentTo(value);
    } catch (err) {
      setError(describeGeneralError(err, "We couldn't send the email. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-header-logo" aria-label="ModelJudge home">ModelJudge</Link>
        <Link to="/login" className="auth-link">SIGN IN</Link>
      </header>
      <main className="auth-main">
        {sentTo ? (
          <div className="auth-card">
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-hint" role="status">
              If an account exists for {sentTo}, we sent a link to choose a new password. It works for one hour. Check your spam folder if you do not see it.
            </p>
            <div className="auth-bottom">
              <Link to="/login" className="auth-bottom-link">Back to sign in</Link>
            </div>
          </div>
        ) : (
          <form className="auth-card" onSubmit={handleSubmit} noValidate>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-hint">Enter your email and we will send you a link to choose a new password.</p>
            {error && <div className="auth-message" role="alert">{error}</div>}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
            <div className="auth-bottom">
              <Link to="/login" className="auth-bottom-link">Back to sign in</Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
