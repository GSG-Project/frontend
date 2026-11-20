import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import CodeInput from "../../components/CodeInput/CodeInput";
import "../../components/CodeInput/CodeInput.css";
import {
  changePassword, confirmTwoFactor, disableTwoFactor, startTwoFactor, updateProfile,
} from "../../services/authService";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { describeCodeError, describeGeneralError, fieldErrorsFrom, formatUserName, getUserInitials } from "../../services/format";
import "./Profile.css";

const EMPTY_PASSWORDS = { oldPassword: "", newPassword: "", confirmPassword: "" };

function generalError(error, fallback) {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  return fieldErrorsFrom(error).form || describeGeneralError(error, fallback);
}

export default function Profile({ user, setUser, onLogout }) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [names, setNames] = useState({ firstName: "", lastName: "" });
  const [nameErrors, setNameErrors] = useState({});
  const [isSavingNames, setIsSavingNames] = useState(false);
  const [nameMessage, setNameMessage] = useState(null);

  const startEditing = () => {
    setNames({ firstName: user?.first_name || "", lastName: user?.last_name || "" });
    setNameErrors({});
    setNameMessage(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNameErrors({});
  };

  const saveNames = async (event) => {
    event.preventDefault();
    if (isSavingNames) return;
    const firstName = names.firstName.trim();
    const lastName = names.lastName.trim();
    if (!firstName) {
      setNameErrors({ first_name: "First name is required." });
      return;
    }
    setIsSavingNames(true);
    setNameErrors({});
    setNameMessage(null);
    try {
      const updated = await updateProfile({ firstName, lastName });
      setUser(updated);
      setIsEditing(false);
      setNameMessage({ tone: "success", text: "Your name was updated." });
    } catch (error) {
      const { form, ...byField } = fieldErrorsFrom(error);
      setNameErrors(byField);
      if (!Object.keys(byField).length || form) {
        setNameMessage({ tone: "error", text: form || generalError(error, "Your name could not be saved.") });
      }
    } finally {
      setIsSavingNames(false);
    }
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const openPasswordForm = () => {
    setPasswords(EMPTY_PASSWORDS);
    setPasswordErrors({});
    setPasswordMessage(null);
    setIsChangingPassword(true);
  };

  const closePasswordForm = () => {
    setIsChangingPassword(false);
    setPasswords(EMPTY_PASSWORDS);
    setPasswordErrors({});
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (isSavingPassword) return;
    const errors = {};
    if (!passwords.oldPassword) errors.old_password = "Enter your current password.";
    if (!passwords.newPassword) errors.new_password = "Enter a new password.";
    if (passwords.newPassword && passwords.confirmPassword !== passwords.newPassword) {
      errors.confirm_password = "The two new passwords do not match.";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSavingPassword(true);
    setPasswordMessage(null);
    try {
      await changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      setIsChangingPassword(false);
      setPasswords(EMPTY_PASSWORDS);
      setPasswordMessage({ tone: "success", text: "Your password was changed. Use the new one next time you sign in." });
    } catch (error) {
      const { form, ...byField } = fieldErrorsFrom(error);
      setPasswordErrors(byField);
      if (!Object.keys(byField).length || form) {
        setPasswordMessage({ tone: "error", text: form || generalError(error, "Your password could not be changed.") });
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Two-step verification: "idle" -> ask for the password ("password") -> ask for the emailed code ("code").
  const [twoFactorStep, setTwoFactorStep] = useState("idle");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState(null);

  const resetTwoFactor = () => {
    setTwoFactorStep("idle");
    setTwoFactorPassword("");
    setTwoFactorCode("");
  };

  const submitTwoFactorPassword = async (event) => {
    event.preventDefault();
    if (twoFactorBusy) return;
    if (!twoFactorPassword) {
      setTwoFactorMessage({ tone: "error", text: "Enter your password." });
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorMessage(null);
    try {
      if (user.two_factor_enabled) {
        setUser(await disableTwoFactor(twoFactorPassword));
        resetTwoFactor();
        setTwoFactorMessage({ tone: "success", text: "Two-step verification is off." });
      } else {
        await startTwoFactor(twoFactorPassword);
        setTwoFactorStep("code");
        setTwoFactorMessage({ tone: "success", text: "We sent a 6 digit code to your email. Check your spam folder too." });
      }
    } catch (error) {
      const text = fieldErrorsFrom(error).password || (error?.status === 429
        ? "A code was sent a moment ago. Please wait a few seconds."
        : generalError(error, "That did not work. Please try again."));
      setTwoFactorMessage({ tone: "error", text });
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const submitTwoFactorCode = async (event) => {
    event.preventDefault();
    if (twoFactorBusy) return;
    if (twoFactorCode.length !== 6) {
      setTwoFactorMessage({ tone: "error", text: "Enter the 6 digit code from the email." });
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorMessage(null);
    try {
      setUser(await confirmTwoFactor(twoFactorCode));
      resetTwoFactor();
      setTwoFactorMessage({ tone: "success", text: "Two-step verification is on. You will get a code by email each time you sign in." });
    } catch (error) {
      setTwoFactorMessage({ tone: "error", text: describeCodeError(error) });
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleSignOut = () => {
    onLogout();
    navigate("/login");
  };

  const fieldClass = (hasError) => `profile-input-field ${hasError ? "profile-input-error" : ""}`;

  if (!user) {
    return (
      <div className="profile-page">
        <AppHeader user={user} onLogout={onLogout} />
        <main className="profile-main">
          <div className="profile-card profile-signed-out">
            <h1 className="profile-card-title">Sign in to see your profile</h1>
            <div className="profile-form-actions">
              <Link to="/login" className="profile-btn-dark">Sign in</Link>
              <Link to="/register" className="profile-btn-outline">Create an account</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="profile-main">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <span className="profile-subtitle">Manage your personal information and account settings</span>
        </div>

        {/* Profile summary */}
        <div className="profile-summary-card">
          <div className="profile-summary-title">Profile Summary</div>
          <div className="profile-summary-content">
            <div className="profile-summary-left">
              <div className="profile-avatar-large" aria-hidden="true">{getUserInitials(user)}</div>
              <div className="profile-summary-info">
                <h3>{formatUserName(user)}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button type="button" className="profile-btn-dark" onClick={startEditing}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal information */}
          <form className="profile-card" onSubmit={saveNames} noValidate>
            <h2 className="profile-card-title">Personal Information</h2>

            {nameMessage && (
              <p className={`profile-message profile-message-${nameMessage.tone}`} role={nameMessage.tone === "error" ? "alert" : "status"}>
                {nameMessage.text}
              </p>
            )}

            <div className="profile-form-grid">
              <div className="profile-input-group">
                <label htmlFor="profile-first-name">First Name</label>
                <input
                  id="profile-first-name"
                  type="text"
                  autoComplete="given-name"
                  className={fieldClass(nameErrors.first_name)}
                  value={isEditing ? names.firstName : user.first_name || ""}
                  onChange={(e) => setNames((prev) => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing || isSavingNames}
                  aria-invalid={Boolean(nameErrors.first_name)}
                />
                {nameErrors.first_name && <p className="profile-field-error">{nameErrors.first_name}</p>}
              </div>
              <div className="profile-input-group">
                <label htmlFor="profile-last-name">Last Name</label>
                <input
                  id="profile-last-name"
                  type="text"
                  autoComplete="family-name"
                  className={fieldClass(nameErrors.last_name)}
                  value={isEditing ? names.lastName : user.last_name || ""}
                  onChange={(e) => setNames((prev) => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing || isSavingNames}
                  aria-invalid={Boolean(nameErrors.last_name)}
                />
                {nameErrors.last_name && <p className="profile-field-error">{nameErrors.last_name}</p>}
              </div>
              <div className="profile-input-group">
                <label htmlFor="profile-email">Email Address</label>
                <input id="profile-email" type="email" className="profile-input-field" value={user.email || ""} disabled />
                <p className="profile-hint">The email cannot be changed.</p>
              </div>
            </div>

            {isEditing && (
              <div className="profile-form-actions">
                <button type="submit" className="profile-btn-dark" disabled={isSavingNames}>
                  {isSavingNames ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="profile-btn-outline" onClick={cancelEditing} disabled={isSavingNames}>
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Password and account */}
          <div className="profile-right-col">
            <div className="profile-card">
              <h2 className="profile-card-title">Password & Security</h2>

              {passwordMessage && (
                <p className={`profile-message profile-message-${passwordMessage.tone}`} role={passwordMessage.tone === "error" ? "alert" : "status"}>
                  {passwordMessage.text}
                </p>
              )}

              {!isChangingPassword ? (
                <>
                  <p className="profile-security-text">Keep your account secure.</p>
                  <button type="button" className="profile-btn-outline profile-btn-start" onClick={openPasswordForm}>
                    Change Password
                  </button>
                </>
              ) : (
                <form className="profile-password-form" onSubmit={savePassword} noValidate>
                  <div className="profile-input-group">
                    <label htmlFor="old-password">Current password</label>
                    <PasswordInput
                      id="old-password"
                      autoComplete="current-password"
                      className={fieldClass(passwordErrors.old_password)}
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))}
                      disabled={isSavingPassword}
                      aria-invalid={Boolean(passwordErrors.old_password)}
                    />
                    {passwordErrors.old_password && <p className="profile-field-error">{passwordErrors.old_password}</p>}
                  </div>
                  <div className="profile-input-group">
                    <label htmlFor="new-password">New password</label>
                    <PasswordInput
                      id="new-password"
                      autoComplete="new-password"
                      className={fieldClass(passwordErrors.new_password)}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                      disabled={isSavingPassword}
                      aria-invalid={Boolean(passwordErrors.new_password)}
                    />
                    {passwordErrors.new_password && <p className="profile-field-error">{passwordErrors.new_password}</p>}
                  </div>
                  <div className="profile-input-group">
                    <label htmlFor="confirm-password">Confirm new password</label>
                    <PasswordInput
                      id="confirm-password"
                      autoComplete="new-password"
                      className={fieldClass(passwordErrors.confirm_password)}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isSavingPassword}
                      aria-invalid={Boolean(passwordErrors.confirm_password)}
                    />
                    {passwordErrors.confirm_password && <p className="profile-field-error">{passwordErrors.confirm_password}</p>}
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="profile-btn-dark" disabled={isSavingPassword}>
                      {isSavingPassword ? "Saving…" : "Update Password"}
                    </button>
                    <button type="button" className="profile-btn-outline" onClick={closePasswordForm} disabled={isSavingPassword}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="profile-card">
              <h2 className="profile-card-title">Two-step verification</h2>

              {twoFactorMessage && (
                <p className={`profile-message profile-message-${twoFactorMessage.tone}`} role={twoFactorMessage.tone === "error" ? "alert" : "status"}>
                  {twoFactorMessage.text}
                </p>
              )}

              {twoFactorStep === "idle" && (
                <>
                  <p className="profile-security-text">
                    {user.two_factor_enabled
                      ? "On. A code is emailed to you each time you sign in."
                      : "Off. Turn it on to also need a code from your email when you sign in."}
                  </p>
                  <button
                    type="button"
                    className="profile-btn-outline profile-btn-start"
                    onClick={() => { setTwoFactorMessage(null); setTwoFactorStep("password"); }}
                  >
                    {user.two_factor_enabled ? "Turn off" : "Turn on"}
                  </button>
                </>
              )}

              {twoFactorStep === "password" && (
                <form className="profile-password-form" onSubmit={submitTwoFactorPassword} noValidate>
                  <div className="profile-input-group">
                    <label htmlFor="two-factor-password">Confirm your password</label>
                    <PasswordInput
                      id="two-factor-password"
                      autoComplete="current-password"
                      className="profile-input-field"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                      disabled={twoFactorBusy}
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="profile-btn-dark" disabled={twoFactorBusy}>
                      {twoFactorBusy ? "Please wait…" : user.two_factor_enabled ? "Turn off" : "Send me a code"}
                    </button>
                    <button type="button" className="profile-btn-outline" onClick={resetTwoFactor} disabled={twoFactorBusy}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {twoFactorStep === "code" && (
                <form className="profile-password-form" onSubmit={submitTwoFactorCode} noValidate>
                  <div className="profile-input-group">
                    <label htmlFor="two-factor-code">6 digit code</label>
                    <CodeInput
                      id="two-factor-code"
                      className="profile-input-field"
                      value={twoFactorCode}
                      onChange={setTwoFactorCode}
                      disabled={twoFactorBusy}
                      autoFocus
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="profile-btn-dark" disabled={twoFactorBusy}>
                      {twoFactorBusy ? "Checking…" : "Turn on"}
                    </button>
                    <button type="button" className="profile-btn-outline" onClick={resetTwoFactor} disabled={twoFactorBusy}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="profile-card">
              <h2 className="profile-card-title">Account Actions</h2>
              <p className="profile-security-text">Sign out of your current account.</p>
              <button type="button" className="profile-btn-outline profile-btn-start" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
