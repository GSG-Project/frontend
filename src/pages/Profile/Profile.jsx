import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import { changePassword, updateProfile } from "../../services/authService";
import { fieldErrorsFrom, formatUserName, getUserInitials } from "../../services/format";
import "./Profile.css";

const EMPTY_PASSWORDS = { oldPassword: "", newPassword: "", confirmPassword: "" };

function generalError(error, fallback) {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error instanceof TypeError) return "Could not reach the server. Check your connection and try again.";
  return fieldErrorsFrom(error).form || error?.message || fallback;
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
            <Link to="/login" className="profile-btn-dark">Sign in</Link>
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
                    <input
                      id="old-password"
                      type="password"
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
                    <input
                      id="new-password"
                      type="password"
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
                    <input
                      id="confirm-password"
                      type="password"
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
