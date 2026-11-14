import { useState } from "react";
import "./PasswordInput.css";

function EyeIcon({ crossed }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function PasswordInput({ id, className = "", disabled = false, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        {...inputProps}
        id={id}
        type={visible ? "text" : "password"}
        className={className}
        disabled={disabled}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        title={visible ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        <EyeIcon crossed={visible} />
      </button>
    </div>
  );
}
