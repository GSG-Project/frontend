import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import CodeInput from "../../components/CodeInput/CodeInput";
import "../../components/CodeInput/CodeInput.css";
import { getCurrentUser, loginUser, resendLoginCode, verifyLoginCode } from "../../services/authService";
import { describeCodeError, describeLoginError } from "../../services/format";
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
  // Set when the account needs an emailed code after the password.
  const [pending, setPending] = useState(null);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function finishSignIn(data) {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    const account = await getCurrentUser();
    setUser(account);
    navigate("/compare");
  }

  async function handleCode(e) {
    e.preventDefault();
    setApiError("");
    setNotice("");
    if (code.length !== 6) {
      setApiError("Enter the 6 digit code from the email.");
      return;
    }
    setIsLoading(true);
    try {
      await finishSignIn(await verifyLoginCode(pending.challenge, code));
    } catch (error) {
      setApiError(describeCodeError(error));
      if (error?.status === 401) setPending(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setApiError("");
    setNotice("");
    try {
      await resendLoginCode(pending.challenge);
      setCode("");
      setWait(30);
      setNotice("A new code was sent. Check your inbox and spam folder.");
    } catch (error) {
      setApiError(describeCodeError(error));
      if (error?.status === 429) setWait(30);
      if (error?.status === 401) setPending(null);
    }
  }

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
      if (data.requires_2fa) {
        setPending(data);
        setCode("");
        setWait(data.resend_after || 30);
        return;
      }
      await finishSignIn(data);
    } catch (error) {
      setApiError(describeLoginError(error));
    } finally {
      clearTimeout(slowTimer);
      setIsSlow(false);
      setIsLoading(false);
    }
  }

  if (pending) {
    return (
      <div className="auth-page">
        <AuthHeader linkText="REGISTER" linkTo="/register" />
        <main className="auth-main">
          <form className="auth-card" onSubmit={handleCode} noValidate>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-hint">
              We sent a 6 digit code to {pending.email}. It works for 10 minutes. Check your spam folder if you do not see it.
            </p>
            {apiError && <div className="auth-message" role="alert">{apiError}</div>}
            {notice && <p className="auth-hint" role="status">{notice}</p>}
            <div className="auth-field">
              <label className="auth-label" htmlFor="code">Sign-in code</label>
              <CodeInput id="code" value={code} onChange={setCode} disabled={isLoading} className="auth-input" autoFocus />
            </div>
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Checking..." : "Verify and sign in"}
            </button>
            <div className="auth-bottom">
              <button type="button" className="auth-bottom-link auth-link-button" onClick={handleResend} disabled={wait > 0}>
                {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
              </button>
              <button type="button" className="auth-bottom-link auth-link-button" onClick={() => { setPending(null); setApiError(""); setNotice(""); }}>
                Back to sign in
              </button>
            </div>
          </form>
        </main>
      </div>
    );
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
            <Link to="/forgot-password" className="auth-bottom-link">Forgot your password?</Link>
            <Link to="/register" className="auth-bottom-link">No account yet? Register</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
