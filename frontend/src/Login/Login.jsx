import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  // =========================
  // STATES
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOGIN SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const API_URL =
  import.meta.env.VITE_API_URL || "https://testhub-backend-y450.onrender.com";

const response = await fetch(`${API_URL}/api/login`, {
  method: "POST",
  body: new URLSearchParams({
    email: formData.email.trim(),
    password: formData.password,
  }),
});

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setMessage("âœ… Login successful!");

        setTimeout(() => {
          if (data.user?.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        }, 500);
      } else if (response.status === 400 || response.status === 401) {
        setMessage(
          "Invalid email or password. Please try again."
        );
      } else {
        setMessage(
          "Something went wrong. Please try again later."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);

      setMessage(
        "Unable to sign in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SIGN UP
  // =========================

 const handleSignup = () => {
  window.location.href = "/register";
};

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = () => {
    window.location.href = "/forgot-password";
  };

  // =========================
  // PASSWORD SHOW / HIDE
  // =========================

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-page">

      {/* =================================================
          BACKGROUND DECORATIONS
      ================================================= */}

      <div className="login-circle login-circle-left"></div>

      <div className="login-circle login-circle-right"></div>


      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="login-navbar">

        {/* LOGO */}

        <div className="login-logo">

          <div className="logo-cap">
            ðŸŽ“
          </div>

          <span className="logo-text">
            Test<span>Hub</span>
          </span>

        </div>


        {/* SIGN UP */}

        <div className="signup-top">

          <span>
            New here?
          </span>

          <button
            type="button"
            className="signup-top-btn"
            onClick={handleSignup}
          >
            Sign Up
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="login-main">


        {/* =================================================
            LEFT INTRO SECTION
        ================================================= */}

        <section className="login-intro">


          {/* INTRO PILL */}

          <div className="intro-pill">

            <span>
              Learn
            </span>

            <b>
              â€¢
            </b>

            <span>
              Practice
            </span>

            <b>
              â€¢
            </b>

            <span>
              Grow
            </span>

          </div>


          {/* MAIN HEADING */}

          <h1>
            Welcome
            <br />
            <span>
              Back!
            </span>
          </h1>


          {/* DESCRIPTION */}

          <p className="intro-description">
            Login to continue your learning
            <br />
            journey and achieve your goals.
          </p>


          {/* =================================================
              FEATURE 1
          ================================================= */}

          <div className="feature-item">

            <div className="feature-icon">
              ðŸ“–
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


          {/* =================================================
              FEATURE 2
          ================================================= */}

          <div className="feature-item">

            <div className="feature-icon">
              ðŸ“Š
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


          {/* =================================================
              FEATURE 3
          ================================================= */}

          <div className="feature-item">

            <div className="feature-icon">
              ðŸ†
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


          {/* =================================================
              QUOTE
          ================================================= */}

          <div className="login-quote">

            <p>
              â€œA little progress each day
              <br />
              adds up to big results.â€
            </p>

            <div className="quote-author">

              <span></span>

              <strong>
                Keep Going
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            RIGHT LOGIN CARD
        ================================================= */}

        <section className="login-card">


          {/* =================================================
              CARD BRAND
          ================================================= */}

          <div className="card-brand">

            <div className="card-logo-icon">
              ðŸŽ“
            </div>

            <div className="card-logo-text">
              Test<span>Hub</span>
            </div>

          </div>


          {/* =================================================
              CARD HEADING
          ================================================= */}

          <h2>
            Welcome Back
            <span className="wave">
              ðŸ‘‹
            </span>
          </h2>


          <p className="card-subtitle">
            Login to continue your learning journey
          </p>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                {/* EMAIL ICON */}

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  âœ‰
                </span>


                {/* EMAIL INPUT */}

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="form-group password-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                {/* PASSWORD ICON */}

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  ðŸ”’
                </span>


                {/* PASSWORD INPUT */}

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />


                {/* =================================================
                    SHOW / HIDE PASSWORD BUTTON

                    IMPORTANT:
                    type="button"
                    keeps it from submitting the form.
                ================================================= */}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    /* EYE OFF */

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />

                      <path
                        d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
                      />

                      <path
                        d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 8.5 4 10 8a16.7 16.7 0 0 1-3.02 4.69"
                      />

                      <path
                        d="M6.61 6.61C4.62 7.96 3.19 10.03 2 12c1.5 4 5 8 10 8 1.61 0 3.09-.45 4.39-1.19"
                      />
                    </svg>

                  ) : (

                    /* EYE */

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>

                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                REMEMBER ME + FORGOT PASSWORD
            ================================================= */}

            <div className="login-options">


              {/* REMEMBER ME */}

              <label className="remember-box">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  Remember me
                </span>

              </label>


              {/* FORGOT PASSWORD */}

              <button
                type="button"
                className="forgot-btn"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              <span>
                {loading ? "Logging in..." : "Login"}
              </span>

              {!loading && (
                <span className="login-arrow">
                  â†’
                </span>
              )}

            </button>

          </form>

          {message && (
            <p
              className={
                message.startsWith("âœ…")
                  ? "login-message success"
                  : "login-message error"
              }
            >
              {message}
            </p>
          )}


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="divider">

            <span></span>

            <p>
              OR CONTINUE WITH
            </p>

            <span></span>

          </div>


          {/* =================================================
              SOCIAL LOGIN
          ================================================= */}

          <div className="social-buttons">


            {/* GOOGLE */}

            <button
              type="button"
              className="social-btn"
              onClick={() => {
                console.log("Google Login");
              }}
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
              className="social-btn"
              onClick={() => {
                console.log("Microsoft Login");
              }}
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


          {/* =================================================
              BOTTOM SIGN UP
          ================================================= */}

          <div className="bottom-signup">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={handleSignup}
            >
              Sign Up
            </button>

          </div>


          {/* =================================================
              SECURITY INFO
          ================================================= */}

          <div className="security-info">

            <span>
              ðŸ”
            </span>

            <span>
              Your information is secure
            </span>

          </div>

        </section>

      </main>


      {/* =================================================
          FLOATING NOTE
      ================================================= */}

      <div className="floating-note">

        <div>
          Better
          <br />
          Questions
          <br />
          Brighter
          <br />
          Futures
        </div>

        <span></span>

      </div>


      {/* =================================================
          BOTTOM RIGHT TEXT
      ================================================= */}

      <div className="bottom-right-text">
        You Can Do It!
      </div>

    </div>
  );
};

export default Login;
