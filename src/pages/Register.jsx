import { useState } from "react";

const styles = `
  .register-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #F3EFFF;
    color: #171426;
    font-family: Arial, Helvetica, sans-serif;
  }

  .register-page * {
    box-sizing: border-box;
  }

  /* الهيدر */
  .auth-header {
    height: 70px;
    background: #FFFFFF;
    border-bottom: 1px solid #A78BFA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6%;
  }

  .auth-header-logo {
    font-size: 23px;
    font-weight: bold;
    color: #6D4AFF;
  }

  .register-link {
    font-size: 13px;
    color: #6D4AFF;
    text-decoration: underline;
  }

  .register-link:hover {
    color: #171426;
  }

  /* الكارد */
  .register-main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px 16px;
  }

  .register-card {
    width: 100%;
    max-width: 420px;
    padding: 32px 28px;
    background: #FFFFFF;
    border: 1px solid #A78BFA;
    border-radius: 8px;
  }

  .register-title {
    margin: 0 0 24px 0;
    text-align: center;
    font-size: 22px;
    color: #171426;
  }

  .register-field {
    margin-bottom: 18px;
  }

  .register-label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #171426;
  }

  .register-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    color: #171426;
    background: #FFFFFF;
    border: 1px solid #A78BFA;
    border-radius: 4px;
  }

  .register-input::placeholder {
    color: #A78BFA;
  }

  .register-input:focus {
    outline: 2px solid #6D4AFF;
    outline-offset: 1px;
  }

  .register-input-error {
    border: 2px solid #6D4AFF;
  }

  .register-error {
    margin: 6px 0 0 0;
    font-size: 12px;
    font-weight: 700;
    color: #6D4AFF;
  }

  .register-button {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 700;
    color: #FFFFFF;
    background: #6D4AFF;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .register-button:hover {
    background: #A78BFA;
    color: #171426;
  }

  .register-bottom {
    margin: 20px 0 0 0;
    text-align: center;
  }

  .register-message {
    margin: 16px 0 0 0;
    padding: 10px 12px;
    font-size: 13px;
    color: #171426;
    background: #F3EFFF;
    border: 1px solid #A78BFA;
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    .register-card {
      padding: 24px 18px;
    }
  }
`;

// ===== الهيدر =====
function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <div className="auth-header-logo">SIMERA</div>
      <a href={linkTo} className="register-link">
        {linkText}
      </a>
    </header>
  );
}

// ===== الصفحة =====
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function validate() {
    const newErrors = {};

    if (email.trim() === "") {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Enter a valid email, like name@example.com.";
    }

    if (password === "") {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // TODO: ربط إنشاء الحساب الحقيقي مع الباك اند لاحقاً
    setMessage("Form is valid. Account creation is simulated, the backend is not connected yet.");
  }

  return (
    <div className="register-page">
      <style>{styles}</style>

      <AuthHeader linkText="Login" linkTo="/login" />

      <main className="register-main">
        <form className="register-card" onSubmit={handleSubmit} noValidate>
          <h1 className="register-title">Create your account</h1>

          <div className="register-field">
            <label className="register-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={errors.email ? "register-input register-input-error" : "register-input"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="register-error">{errors.email}</p>}
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? "register-input register-input-error" : "register-input"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="register-error">{errors.password}</p>}
          </div>

          <button type="submit" className="register-button">
            Create account
          </button>

          {message && <p className="register-message">{message}</p>}

          <p className="register-bottom">
            <a href="/login" className="register-link">
              Already have an account? Login
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}