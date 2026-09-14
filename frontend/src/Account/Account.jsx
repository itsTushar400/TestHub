import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Account.css";

const API_URL = "${import.meta.env.VITE_API_URL}";

function Account() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    id: null,
    name: "User",
    email: "student@example.com",
    role: "student",
    profile_photo: null,
  });

  const [stats, setStats] = useState({
    testsTaken: 0,
    averageScore: 0,
    bestScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= PHOTO URL =================

  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    return `${API_URL}${photo}`;
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile(token);
    fetchStats(token);
  }, [navigate]);

  // ================= LOAD PROFILE =================

  const loadProfile = async (token) => {
    try {
      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load profile"
        );
      }

      const profile = data.user;

      setUser({
        id: profile.id,
        name: profile.name || "User",
        email:
          profile.email || "student@example.com",
        role: profile.role || "student",
        profile_photo: profile.profile_photo || null,
      });

      setEditName(profile.name || "");

      // Keep localStorage updated
      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...profile,
        })
      );
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH STATS =================

  const fetchStats = async (token) => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats(
          data.stats || {
            testsTaken: 0,
            averageScore: 0,
            bestScore: 0,
          }
        );
      }
    } catch (err) {
      console.error("Account stats error:", err);
    }
  };

  // ================= FILE SELECT =================

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Image size must be less than 2 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  // ================= REMOVE SELECTED PREVIEW =================

  const clearSelectedPhoto = () => {
    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ================= SAVE PROFILE =================

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!editName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "name",
        editName.trim()
      );

      if (selectedFile) {
        formData.append(
          "profilePhoto",
          selectedFile
        );
      }

      const response = await fetch(
        `${API_URL}/api/profile/update`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      const updatedUser = data.user;

      setUser({
        id: updatedUser.id,
        name: updatedUser.name || "User",
        email:
          updatedUser.email ||
          "student@example.com",
        role:
          updatedUser.role || "student",
        profile_photo:
          updatedUser.profile_photo || null,
      });

      setEditName(updatedUser.name || "");

      // Update localStorage
      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...updatedUser,
        })
      );

      clearSelectedPhoto();

      setEditMode(false);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= REMOVE PROFILE PHOTO =================

  const handleRemovePhoto = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setPhotoUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/profile/photo`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove photo"
        );
      }

      setUser((prev) => ({
        ...prev,
        profile_photo: null,
      }));

      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          profile_photo: null,
        })
      );

      clearSelectedPhoto();

      setMessage(
        "Profile photo removed successfully."
      );
    } catch (err) {
      console.error(
        "Remove photo error:",
        err
      );

      setError(
        err.message ||
          "Unable to remove photo."
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ================= EDIT =================

  const startEdit = () => {
    setMessage("");
    setError("");
    setEditName(user.name);
    setEditMode(true);
  };

  const cancelEdit = () => {
    clearSelectedPhoto();

    setEditName(user.name);
    setEditMode(false);

    setMessage("");
    setError("");
  };

  // ================= AVATAR =================

  const firstLetter =
    user.name?.charAt(0)?.toUpperCase() || "U";

  const displayPhoto =
    previewUrl ||
    getPhotoUrl(user.profile_photo);

  // ================= RENDER =================

  return (
    <div className="account-page">

      {/* ================= NAVBAR ================= */}

      <nav className="account-navbar">

        {/* LOGO */}
        <Link
          to="/"
          className="account-logo"
          onClick={() => setMenuOpen(false)}
        >
          Online Test
        </Link>


        {/* DESKTOP / MOBILE NAVIGATION */}
        <div
          className={`account-nav-links ${
            menuOpen ? "mobile-open" : ""
          }`}
        >

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/tests"
            onClick={() => setMenuOpen(false)}
          >
            Tests
          </Link>

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>

        </div>


        {/* USER NAV */}
        <Link
          to="/account"
          className="account-user-nav active"
          onClick={() => setMenuOpen(false)}
        >

          <div className="account-mini-avatar">

            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
              />
            ) : (
              firstLetter
            )}

          </div>

          <span>
            {user.name}
          </span>

          <span className="account-arrow">
            ▾
          </span>

        </Link>


        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          className={`account-hamburger ${
            menuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="account-container">

        {/* HEADER */}

        <section className="account-header">

          <div>

            <span className="account-label">
              MY ACCOUNT
            </span>

            <h1>
              Account Overview
            </h1>

            <p>
              Manage your profile, personal
              information and learning progress.
            </p>

          </div>

        </section>


        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="account-message success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="account-message error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* ================= PROFILE CARD ================= */}

        <section className="account-profile-card">

          <div className="account-profile-left">

            {/* PROFILE PHOTO */}

            <div className="account-avatar-wrapper">

              <div className="account-large-avatar">

                {loading ? (
                  <div className="avatar-loader">
                    <span></span>
                  </div>
                ) : displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Profile"
                  />
                ) : (
                  firstLetter
                )}

              </div>

              {editMode && (
                <button
                  type="button"
                  className="avatar-camera-btn"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  title="Change profile photo"
                >
                  📷
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                hidden
              />

            </div>


            {/* PROFILE INFO */}

            <div className="account-profile-info">

              {editMode ? (
                <div className="profile-name-edit">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    maxLength={100}
                  />

                </div>
              ) : (
                <h2>
                  {user.name}
                </h2>
              )}

              <p>
                {user.email}
              </p>

              <span className="account-role">
                🎓{" "}
                {user.role === "admin"
                  ? "Administrator"
                  : "Student"}
              </span>

              {editMode && (
                <div className="photo-help">
                  JPG, PNG or WEBP • Max 2 MB
                </div>
              )}

            </div>

          </div>


          {/* PROFILE ACTIONS */}

          <div className="profile-card-actions">

            {!editMode ? (
              <button
                className="edit-profile-btn"
                onClick={startEdit}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="profile-edit-actions">

                <button
                  className="save-profile-btn"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "✓ Save Changes"}
                </button>

                <button
                  className="cancel-profile-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>
            )}

          </div>

        </section>


        {/* ================= PHOTO CONTROLS ================= */}

        {editMode && (
          <section className="photo-control-card">

            <div>

              <strong>
                Profile Photo
              </strong>

              <span>
                Add a professional photo to
                personalize your account.
              </span>

            </div>

            <div className="photo-control-buttons">

              <button
                type="button"
                className="change-photo-btn"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                📷{" "}
                {selectedFile
                  ? "Change Selected"
                  : "Choose Photo"}
              </button>

              {selectedFile && (
                <button
                  type="button"
                  className="discard-photo-btn"
                  onClick={clearSelectedPhoto}
                >
                  Undo
                </button>
              )}

              {user.profile_photo &&
                !selectedFile && (
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={handleRemovePhoto}
                    disabled={photoUploading}
                  >
                    {photoUploading
                      ? "Removing..."
                      : "Remove Photo"}
                  </button>
                )}

            </div>

          </section>
        )}


        {/* ================= STATS ================= */}

        <section className="account-stats">

          <div className="account-stat-card">

            <div className="account-stat-icon blue">
              📝
            </div>

            <div>
              <span>
                Tests Taken
              </span>

              <strong>
                {loading
                  ? "..."
                  : stats.testsTaken || 0}
              </strong>
            </div>

          </div>


          <div className="account-stat-card">

            <div className="account-stat-icon purple">
              📊
            </div>

            <div>
              <span>
                Average Score
              </span>

              <strong>
                {loading
                  ? "..."
                  : `${Number(
                      stats.averageScore || 0
                    ).toFixed(1)}%`}
              </strong>
            </div>

          </div>


          <div className="account-stat-card">

            <div className="account-stat-icon orange">
              🏆
            </div>

            <div>
              <span>
                Best Score
              </span>

              <strong>
                {loading
                  ? "..."
                  : `${Number(
                      stats.bestScore || 0
                    ).toFixed(1)}%`}
              </strong>
            </div>

          </div>


          <div className="account-stat-card">

            <div className="account-stat-icon green">
              🚀
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                Active
              </strong>
            </div>

          </div>

        </section>


        {/* ================= ACCOUNT DETAILS ================= */}

        <section className="account-details-card">

          <div className="account-section-title">

            <span>
              PROFILE INFORMATION
            </span>

            <h2>
              Personal Details
            </h2>

          </div>


          <div className="account-details-grid">

            <div className="detail-item">

              <span>
                👤 Full Name
              </span>

              <strong>
                {user.name}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                📧 Email Address
              </span>

              <strong>
                {user.email}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                🎓 Account Type
              </span>

              <strong>
                {user.role === "admin"
                  ? "Administrator"
                  : "Student"}
              </strong>

            </div>


            <div className="detail-item">

              <span>
                🔐 Account Status
              </span>

              <strong className="status-active">
                ● Active
              </strong>

            </div>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="account-actions">

          <Link
            to="/dashboard"
            className="account-action-card"
          >

            <div className="action-icon">
              📊
            </div>

            <div>
              <strong>
                My Dashboard
              </strong>

              <span>
                View your complete performance
              </span>
            </div>

            <b>
              →
            </b>

          </Link>


          <Link
            to="/tests"
            className="account-action-card"
          >

            <div className="action-icon">
              📝
            </div>

            <div>
              <strong>
                Take a Test
              </strong>

              <span>
                Explore available tests
              </span>
            </div>

            <b>
              →
            </b>

          </Link>


          <button
            className="account-action-card logout-action"
            onClick={handleLogout}
          >

            <div className="action-icon">
              🚪
            </div>

            <div>
              <strong>
                Logout
              </strong>

              <span>
                Sign out from your account
              </span>
            </div>

            <b>
              →
            </b>

          </button>

        </section>

      </main>

    </div>
  );
}

export default Account;
