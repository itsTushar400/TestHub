import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
      }

      // =========================
      // SAVE TOKEN
      // =========================

      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
          sessionStorage.removeItem("token");
        } else {
          sessionStorage.setItem("token", data.token);
          localStorage.removeItem("token");
        }
      }

      // =========================
      // SAVE USER
      // =========================

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // Login successful
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = () => {
    console.log("Google login clicked");

    // Google OAuth baad me connect kar sakte hain.
  };

  // =========================
  // MICROSOFT LOGIN
  // =========================

  const handleMicrosoftLogin = () => {
    console.log("Microsoft login clicked");

    // Microsoft OAuth baad me connect kar sakte hain.
  };

  return (
    <div className="login-page">

      {/* =========================
          BACKGROUND DECORATIONS
      ========================== */}

      <div className="bg-circle bg-circle-left"></div>
      <div className="bg-circle bg-circle-right"></div>

      {/* =========================
          HEADER
      ========================== */}

      <header className="login-header">

        {/* LOGO */}

        <Link
          to="/"
          className="brand"
        >
          <div className="brand-icon">
            <span className="graduation-icon">
              🎓
            </span>
          </div>

          <span className="brand-text">
            Test<span>Hub</span>
          </span>
        </Link>

        {/* NAVIGATION */}

        <nav className="top-nav">
          <Link to="/">
            Learn
          </Link>

          <Link to="/tests">
            Practice
          </Link>

          <Link to="/">
            Grow
          </Link>
        </nav>

        {/* SIGN UP */}

        <div className="signup-header">
          <span>
            New here?
          </span>

          <Link
            to="/register"
            className="signup-button"
          >
            Sign Up
          </Link>
        </div>

      </header>

      {/* =========================
          MAIN
      ========================== */}

      <main className="login-main">

        {/* =========================
            LEFT SECTION
        ========================== */}

        <section className="login-intro">

          {/* BADGE */}

          <div className="learning-badge">
            <span className="badge-icon">
              🎓
            </span>

            <span>
              Your Learning Partner
            </span>
          </div>

          {/* HEADING */}

          <h1>
            Welcome
            <br />
            <span>
              Back!
            </span>
          </h1>

          <p className="intro-text">
            Login to continue your learning
            <br className="desktop-break" />
            journey and achieve your goals.
          </p>

          {/* =========================
              FEATURE 1
          ========================== */}

          <div className="feature-item">

            <div className="feature-icon blue">
              <span>▣</span>
            </div>

            <div>
              <h3>
                Take Online Tests
              </h3>

              <p>
                Practice and improve
              </p>
            </div>

          </div>

          {/* =========================
              FEATURE 2
          ========================== */}

          <div className="feature-item">

            <div className="feature-icon green">
              <span>▥</span>
            </div>

            <div>
              <h3>
                Track Progress
              </h3>

              <p>
                See your growth
              </p>
            </div>

          </div>

          {/* =========================
              FEATURE 3
          ========================== */}

          <div className="feature-item">

            <div className="feature-icon purple">
              <span>🏆</span>
            </div>

            <div>
              <h3>
                Achieve Goals
              </h3>

              <p>
                Be exam ready
              </p>
            </div>

          </div>

          {/* QUOTE */}

          <div className="quote-box">

            <p>
              “A little progress each day
              <br />
              adds up to big results.”
            </p>

            <div className="quote-line">
              <span></span>

              <strong>
                Keep Going
              </strong>
            </div>

          </div>

        </section>

        {/* =========================
            LOGIN CARD
        ========================== */}

        <section className="login-card">

          {/* CARD BRAND */}

          <div className="card-brand">

            <div className="card-brand-icon">
              <span>
                🎓
              </span>
            </div>

            <span className="card-brand-text">
              Test<span>Hub</span>
            </span>

          </div>

          {/* TITLE */}

          <h2>
            Welcome Back
          </h2>

          <p className="card-subtitle">
            Login to continue your learning journey
          </p>

          {/* ERROR */}

          {error && (
            <div className="login-error">
              <span className="error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* =========================
              LOGIN FORM
          ========================== */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "◉"
                    : "◉"}
                </button>

              </div>

            </div>

            {/* REMEMBER / FORGOT */}

            <div className="form-options">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span className="custom-checkbox">
                  {rememberMe && "✓"}
                </span>

                <span>
                  Remember me
                </span>

              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>

                  <span>
                    Logging in...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Login
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =========================
              DIVIDER
          ========================== */}

          <div className="divider">

            <span></span>

            <p>
              OR CONTINUE WITH
            </p>

            <span></span>

          </div>

          {/* =========================
              SOCIAL BUTTONS
          ========================== */}

          <div className="social-buttons">

            {/* GOOGLE */}

            <button
              type="button"
              className="social-button"
              onClick={handleGoogleLogin}
            >

              <span className="google-icon">
                G
              </span>

              <span>
                Continue with Google
              </span>

            </button>

            {/* MICROSOFT */}

            <button
              type="button"
              className="social-button"
              onClick={handleMicrosoftLogin}
            >

              <span className="microsoft-icon">

                <i></i>
                <i></i>
                <i></i>
                <i></i>

              </span>

              <span>
                Continue with Microsoft
              </span>

            </button>

          </div>

          {/* =========================
              SIGN UP
          ========================== */}

          <div className="card-signup">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Sign Up
            </Link>

          </div>

          {/* =========================
              SECURITY
          ========================== */}

          <div className="security-note">

            <span className="security-icon">
              ✓
            </span>

            <span>
              Your information is secure
            </span>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Login;