import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "./Register.css";

function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <div className="auth-header-logo">SIMERA</div>
      <a href={linkTo} className="auth-link">{linkText}</a>
    </header>
  );
}

export default function Register({ setUser }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
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
      const data = await registerUser(email, name, password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      setUser(data.user);
      navigate("/compare");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader linkText="LOGIN" linkTo="/login" />
      
      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Create your account</h1>

          {apiError && <div className="auth-message">{apiError}</div>}

          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              placeholder="John Doe" 
              className={`auth-input ${errors.name ? "auth-input-error" : ""}`} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            {errors.name && <p className="auth-error">{errors.name}</p>}
          </div>

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
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <div className="auth-bottom">
            <a href="/login" className="auth-bottom-link">Already have an account? Login</a>
          </div>
        </form>
      </main>
    </div>
  );
}