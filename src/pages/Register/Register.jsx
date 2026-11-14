import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { describeGeneralError, fieldErrorsFrom } from "../../services/format";
import "./Register.css";

function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <Link to="/" className="auth-header-logo" aria-label="ModelJudge home">ModelJudge</Link>
      <Link to={linkTo} className="auth-link">{linkText}</Link>
    </header>
  );
}

export default function Register({ setUser }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  function validate() {
    const newErrors = {};
    if (!firstName.trim()) newErrors.first_name = "First name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
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
      const data = await registerUser({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      setUser(data.user);
      navigate("/compare");
    } catch (error) {
      const { form, ...byField } = fieldErrorsFrom(error);
      if (Object.keys(byField).length > 0) {
        setErrors(byField);
        if (form) setApiError(form);
      } else {
        setApiError(form || describeGeneralError(error, "We couldn't create your account. Please try again."));
      }
    } finally {
      clearTimeout(slowTimer);
      setIsSlow(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader linkText="LOGIN" linkTo="/login" />

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Create your account</h1>

          {apiError && <div className="auth-message" role="alert">{apiError}</div>}

          <div className="auth-field-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="first-name">First name</label>
              <input
                id="first-name"
                type="text"
                autoComplete="given-name"
                placeholder="Sara"
                className={`auth-input ${errors.first_name ? "auth-input-error" : ""}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={Boolean(errors.first_name)}
              />
              {errors.first_name && <p className="auth-error">{errors.first_name}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="last-name">
                Last name <span className="auth-optional">(optional)</span>
              </label>
              <input
                id="last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Ali"
                className={`auth-input ${errors.last_name ? "auth-input-error" : ""}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={Boolean(errors.last_name)}
              />
              {errors.last_name && <p className="auth-error">{errors.last_name}</p>}
            </div>
          </div>

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
              autoComplete="new-password"
              placeholder="••••••••"
              className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          {isSlow && (
            <p className="auth-hint" role="status">
              The server is waking up. This can take up to a minute.
            </p>
          )}

          <div className="auth-bottom">
            <Link to="/login" className="auth-bottom-link">Already have an account? Login</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
