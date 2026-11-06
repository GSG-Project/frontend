import { useState } from "react";

const styles = `
  .login-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #F3EFFF;
    color: #171426;
    font-family: Arial, Helvetica, sans-serif;
  }

  .login-page * {
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

  .login-link {
    font-size: 13px;
    color: #6D4AFF;
    text-decoration: underline;
  }

  .login-link:hover {
    color: #171426;
  }

  /* الكارد */
  .login-main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px 16px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 32px 28px;
    background: #FFFFFF;
    border: 1px solid #A78BFA;
    border-radius: 8px;
  }

  .login-title {
    margin: 0 0 24px 0;
    text-align: center;
    font-size: 22px;
    color: #171426;
  }

  .login-field {
    margin-bottom: 18px;
  }

  .login-label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #171426;
  }

  .login-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    color: #171426;
    background: #FFFFFF;
    border: 1px solid #A78BFA;
    border-radius: 4px;
  }

  .login-input::placeholder {
    color: #A78BFA;
  }

  .login-input:focus {
    outline: 2px solid #6D4AFF;
    outline-offset: 1px;
  }

  .login-input-error {
    border: 2px solid #6D4AFF;
  }

  .login-error {
    margin: 6px 0 0 0;
    font-size: 12px;
    font-weight: 700;
    color: #6D4AFF;
  }

  .login-button {
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

  .login-button:hover {
    background: #A78BFA;
    color: #171426;
  }

  .login-bottom {
    margin: 20px 0 0 0;
    text-align: center;
  }

  .login-message {
    margin: 16px 0 0 0;
    padding: 10px 12px;
    font-size: 13px;
    color: #171426;
    background: #F3EFFF;
    border: 1px solid #A78BFA;
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    .login-card {
      padding: 24px 18px;
    }
  }
`;

// ===== الهيدر الخاص بصفحات الدخول والتسجيل =====
function AuthHeader({ linkText, linkTo }) {
  return (
    <header className="auth-header">
      <div className="auth-header-logo">SIMERA</div>
      <a href={linkTo} className="login-link">
        {linkText}
      </a>
    </header>
  );
}

// ===== الصفحة =====
export default function Login() {
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

    // TODO: ربط تسجيل الدخول الحقيقي مع الباك اند لاحقاً
    setMessage("Form is valid. Sign in is simulated, the backend is not connected yet.");
  }

  return (
    <div className="login-page">
      <style>{styles}</style>

      <AuthHeader linkText="Register" linkTo="/register" />

      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h1 className="login-title">Welcome back</h1>

          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={errors.email ? "login-input login-input-error" : "login-input"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="login-error">{errors.email}</p>}
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? "login-input login-input-error" : "login-input"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="login-error">{errors.password}</p>}
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>

          {message && <p className="login-message">{message}</p>}

          <p className="login-bottom">
            <a href="/register" className="login-link">
              No account yet? Register
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}