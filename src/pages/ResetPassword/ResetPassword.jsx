import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { confirmPasswordReset } from "../../services/authService";
import { describeGeneralError, fieldErrorsFrom } from "../../services/format";
import "../Login/Login.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const header = (
    <header className="auth-header">
      <Link to="/" className="auth-header-logo" aria-label="ModelJudge home">ModelJudge</Link>
      <Link to="/login" className="auth-link">SIGN IN</Link>
    </header>
  );

  if (!uid || !token) {
    return (
      <div className="auth-page">
        {header}
        <main className="auth-main">
          <div className="auth-card">
            <h1 className="auth-title">Link not valid</h1>
            <p className="auth-hint">This reset link is incomplete. Ask for a new one.</p>
            <div className="auth-bottom">
              <Link to="/forgot-password" className="auth-bottom-link">Send a new link</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        {header}
        <main className="auth-main">
          <div className="auth-card">
            <h1 className="auth-title">Password changed</h1>
            <p className="auth-hint" role="status">You can now sign in with your new password.</p>
            <Link to="/login" className="auth-button" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Go to sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const newErrors = {};
    if (!password) newErrors.password = "Enter a new password.";
    else if (confirm !== password) newErrors.confirm = "The two passwords do not match.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setIsLoading(true);
    try {
      await confirmPasswordReset({ uid, token, newPassword: password });
      setDone(true);
    } catch (err) {
      const { form, ...byField } = fieldErrorsFrom(err);
      if (byField.new_password) setErrors({ password: byField.new_password });
      else setMessage(err?.status === 400 && err.data?.detail
        ? `${[].concat(err.data.detail).join(" ")} Ask for a new link.`
        : form || describeGeneralError(err, "Your password could not be changed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {header}
      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Choose a new password</h1>
          {message && (
            <div className="auth-message" role="alert">
              {message} <Link to="/forgot-password" className="auth-bottom-link">Send a new link</Link>
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label" htmlFor="new-password">New password</label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm-password">Confirm new password</label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              className={`auth-input ${errors.confirm ? "auth-input-error" : ""}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm && <p className="auth-error">{errors.confirm}</p>}
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Saving..." : "Change password"}
          </button>
        </form>
      </main>
    </div>
  );
}
