import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import "./Profile.css";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "User",
    lastName: user?.lastName || "Name",
    email: user?.email || "user@example.com",
    profileImage: user?.profileImage || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      profileImage: formData.profileImage,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "User",
      lastName: user?.lastName || "Name",
      email: user?.email || "user@example.com",
      profileImage: user?.profileImage || null,
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName.charAt(0).toUpperCase() : "";
    const l = formData.lastName ? formData.lastName.charAt(0).toUpperCase() : "";
    return f + l || "UN";
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <AppHeader user={user} onLogout={handleSignOut} />

      <main className="profile-main">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <span className="profile-subtitle">Manage your personal information and account settings</span>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-title">Profile Summary</div>
          <div className="profile-summary-content">
            <div className="profile-summary-left">
              <div>
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-large">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  {isEditing && (
                    <div className="profile-avatar-overlay" onClick={() => fileInputRef.current.click()}>
                      Upload
                    </div>
                  )}
                </div>
                {isEditing && formData.profileImage && (
                  <button className="profile-btn-text-danger" onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}>
                    Remove photo
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="profile-summary-info">
                <h3>{formData.firstName} {formData.lastName}</h3>
                <p>{formData.email}</p>
                <span>Account Member</span>
              </div>
            </div>

            {!isEditing && (
              <button className="profile-btn-dark" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h2 className="profile-card-title">Personal Information</h2>
            <div className="profile-form-grid">
              <div className="profile-input-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="profile-input-field"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="profile-input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="profile-input-field"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="profile-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="profile-input-field"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                />
              </div>
            </div>

            {isEditing && (
              <div className="profile-form-actions">
                <button className="profile-btn-dark" onClick={handleSave}>Save Changes</button>
                <button className="profile-btn-outline" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>

          <div className="profile-right-col">
            <div className="profile-card">
              <h2 className="profile-card-title">Password & Security</h2>
              <p className="profile-security-text">Keep your account secure.</p>
              <button
                className="profile-btn-outline"
                style={{ alignSelf: "flex-start" }}
                onClick={() => alert("Change Password requires backend integration. This feature is coming soon.")}
              >
                Change Password
              </button>
            </div>

            <div className="profile-card">
              <h2 className="profile-card-title">Account Actions</h2>
              <p className="profile-security-text">Sign out of your current account.</p>
              <button className="profile-btn-outline" style={{ alignSelf: "flex-start" }} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}