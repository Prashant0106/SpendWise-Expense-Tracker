import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

import { UserRound, Mail, CalendarDays, Pencil, Save, X } from "lucide-react";

import "./Profile.css";

function Profile() {
  const { user, setUser, loading } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-loading">Unable to load user profile.</div>;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  // Start editing
  const handleEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });

    setMessage("");
    setError("");
    setIsEditing(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save updated profile
  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put("/auth/profile", {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      setUser(response.data.user);

      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal account information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <UserRound size={40} />
        </div>

        {!isEditing ? (
          <>
            <h2>{user.name}</h2>
            <p className="profile-subtitle">SpendWise Member</p>

            <div className="profile-details">
              <div className="profile-detail">
                <Mail size={20} />
                <div>
                  <span>Email Address</span>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="profile-detail">
                <CalendarDays size={20} />
                <div>
                  <span>Member Since</span>
                  <p>{memberSince}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEdit}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          </>
        ) : (
          <form className="profile-edit-form" onSubmit={handleSave}>
            <h2>Edit Profile</h2>
            <p className="profile-subtitle">
              Update your personal information.
            </p>

            <div className="profile-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && <p className="profile-success">{message}</p>}

        {error && <p className="profile-error">{error}</p>}
      </div>
    </div>
  );
}

export default Profile;
