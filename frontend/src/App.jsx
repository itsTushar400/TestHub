import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import "./App.css";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/Users/AdminUsers";
import AdminTests from "./Admin/Tests/AdminTests";
import AdminQuestions from "./Admin/Questions/AdminQuestions";
import AllQuestions from "./Admin/Questions/AllQuestions";
import AdminResults from "./Admin/Results/AdminResults";
import About from "./About/About";
import Contact from "./Contact/Contact";
import Dashboard from "./Dashboard/Dashboard";
import AIAssistant from "./AI/AIAssistant";
import Tests from "./Tests/Tests";
import Account from "./Account/Account";
import Certificate from "./Certificates/Certificate"
import AdminCertificates from "./Admin/AdminCertificates";
import TestInstructions from "./TestInstructions/TestInstructions";
import AdminNotifications from "./Admin/AdminNotifications";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import Register from "./Auth/Register";
import Results from "./Results/Results";

import Certificates from "./Certificates/Certificates";
import VerifyCertificate from "./Certificates/VerifyCertificate";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setMenuOpen(false);

    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      {/* ================= LOGO ================= */}

      <Link
        to="/"
        className="logo"
        onClick={closeMenu}
      >
        <span className="logo-icon">🎓</span>

        <span className="logo-content">
          <strong>TestHub</strong>
          <small>LEARN • PRACTICE • GROW</small>
        </span>
      </Link>


      {/* ================= HAMBURGER ================= */}

      <button
        type="button"
        className={`mobile-menu-btn ${
          menuOpen ? "open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* ================= NAV LINKS ================= */}

      <div
        className={`nav-links ${
          menuOpen ? "mobile-open" : ""
        }`}
      >

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          onClick={closeMenu}
        >
          Home
        </NavLink>


        <NavLink
          to="/tests"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          onClick={closeMenu}
        >
          Tests
        </NavLink>


        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          onClick={closeMenu}
        >
          About
        </NavLink>


        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          onClick={closeMenu}
        >
          Contact
        </NavLink>


        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          onClick={closeMenu}
        >
          Dashboard
        </NavLink>


        {/* Mobile buttons */}

        <div className="mobile-nav-buttons">

          {isLoggedIn ? (
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="signup-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

      </div>


      {/* ================= DESKTOP BUTTONS ================= */}

      <div className="nav-buttons">

        {isLoggedIn ? (
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="login-btn"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="signup-btn"
            >
              Sign Up
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("${import.meta.env.VITE_API_URL}/api/leaderboard");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leaderboard");
        }

        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Leaderboard error:", error);
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <Navbar />

<section className="hero home-hero">

  {/* LEFT CONTENT */}
  <div className="hero-left home-hero-left">

    <div className="hero-tag">
      🚀 LEARN • PRACTICE • IMPROVE
    </div>

    <h1>
      Practice Today,
      <br />
      Build a <span>Better Tomorrow</span>
    </h1>

    <p>
      Take online tests, improve your knowledge and track
      your progress with TestHub. Learn smarter, score
      higher and achieve your goals.
    </p>

    <div className="hero-buttons">

      <Link
        to={
          localStorage.getItem("token")
            ? "/tests"
            : "/register"
        }
        className="primary-btn"
      >
        Get Started <span>→</span>
      </Link>

      <Link
        to="/tests"
        className="secondary-btn"
      >
        📖 Explore Tests
      </Link>

    </div>

    {/* STATS */}
    <div className="hero-stat-row">

      <div className="hero-stat-box">
        <div className="hero-stat-icon">👥</div>
        <div>
          <strong>10K+</strong>
          <span>Active Students</span>
        </div>
      </div>

      <div className="hero-stat-box">
        <div className="hero-stat-icon">📄</div>
        <div>
          <strong>500+</strong>
          <span>Practice Tests</span>
        </div>
      </div>

      <div className="hero-stat-box">
        <div className="hero-stat-icon">🏆</div>
        <div>
          <strong>95%</strong>
          <span>Success Rate</span>
        </div>
      </div>

    </div>

  </div>


  {/* RIGHT SIDE */}
  <div className="hero-right professional-hero-right">

    <div className="hero-glow"></div>

    <div className="hero-big-circle"></div>

    <div className="young-student">
  <img
    src="/hero-student.png"
    alt="Student learning online"
    className="hero-student-image"
  />
</div>

  </div>

</section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Wide Range of Tests</h3>
          <p>Subject-wise tests designed for better preparation.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Instant Results</h3>
          <p>Get your score immediately after submitting the test.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Analyze your performance and improve weak areas.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💻</div>
          <h3>Learn Anywhere</h3>
          <p>Take tests from laptop, tablet or mobile.</p>
        </div>
      </section>

      <section className="categories">
        <div className="section-heading">
          <div className="section-tag">TEST CATEGORIES</div>
          <h2>Choose Your Test</h2>
          <p>Practice with tests designed for your preparation.</p>
        </div>

        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon blue">🧠</div>
            <h3>General Knowledge</h3>
            <p>30 Questions • 30 Minutes</p>
            <Link to="/tests">Start Test →</Link>
          </div>

          <div className="category-card">
            <div className="category-icon purple">🧮</div>
            <h3>Aptitude</h3>
            <p>25 Questions • 30 Minutes</p>
            <Link to="/tests">Start Test →</Link>
          </div>

          <div className="category-card">
            <div className="category-icon orange">💻</div>
            <h3>Computer</h3>
            <p>20 Questions • 20 Minutes</p>
            <Link to="/tests">Start Test →</Link>
          </div>

          <div className="category-card">
            <div className="category-icon green">⚛️</div>
            <h3>Programming</h3>
            <p>30 Questions • 40 Minutes</p>
            <Link to="/tests">Start Test →</Link>
          </div>
        </div>
      </section>

       {/* ================= POPULAR TESTS ================= */}

<section className="popular-tests">

  <div className="section-heading">
    <div className="section-tag">POPULAR TESTS</div>

    <h2>Challenge Yourself 🔥</h2>

    <p>
      Test your knowledge with our most popular practice tests.
    </p>
  </div>

  <div className="popular-test-grid">

    {/* JavaScript */}
    <div className="popular-test-card">

      <div className="popular-test-top">
        <div className="popular-test-icon">
          ⚡
        </div>

        <span className="popular-badge">
          Popular
        </span>
      </div>

      <h3>JavaScript Basics</h3>

      <p>
        Test your JavaScript fundamentals and improve your coding knowledge.
      </p>

      <div className="popular-test-info">
        <span>📝 20 Questions</span>
        <span>⏱️ 20 Minutes</span>
      </div>

      <Link to="/tests" className="popular-test-btn">
        Start Test →
      </Link>

    </div>


    {/* React */}
    <div className="popular-test-card">

      <div className="popular-test-top">
        <div className="popular-test-icon">
          ⚛️
        </div>

        <span className="popular-badge">
          Trending
        </span>
      </div>

      <h3>React.js Fundamentals</h3>

      <p>
        Check your React knowledge including components, hooks and state.
      </p>

      <div className="popular-test-info">
        <span>📝 25 Questions</span>
        <span>⏱️ 30 Minutes</span>
      </div>

      <Link to="/tests" className="popular-test-btn">
        Start Test →
      </Link>

    </div>


    {/* Aptitude */}
    <div className="popular-test-card">

      <div className="popular-test-top">
        <div className="popular-test-icon">
          🧮
        </div>

        <span className="popular-badge">
          Top Rated
        </span>
      </div>

      <h3>Aptitude Challenge</h3>

      <p>
        Improve your logical thinking, mathematics and problem-solving skills.
      </p>

      <div className="popular-test-info">
        <span>📝 30 Questions</span>
        <span>⏱️ 30 Minutes</span>
      </div>

      <Link to="/tests" className="popular-test-btn">
        Start Test →
      </Link>

    </div>

  </div>

  <div className="popular-view-all">
    <Link to="/tests">
      View All Tests →
    </Link>
  </div>

</section>


{/* ================= HOW IT WORKS ================= */}

<section className="how-it-works">

  <div className="section-heading">
    <div className="section-tag">HOW IT WORKS</div>

    <h2>Start Your Test in 4 Simple Steps</h2>

    <p>
      Everything you need to practice, test and improve your knowledge.
    </p>
  </div>

  <div className="steps-container">

    {/* Step 1 */}
    <div className="step-card">

      <div className="step-number">
        01
      </div>

      <div className="step-icon">
        🔍
      </div>

      <h3>Choose a Test</h3>

      <p>
        Explore different categories and select a test
        that matches your preparation.
      </p>

    </div>


    {/* Step 2 */}
    <div className="step-card">

      <div className="step-number">
        02
      </div>

      <div className="step-icon">
        📝
      </div>

      <h3>Answer Questions</h3>

      <p>
        Read each question carefully and select the
        best answer within the given time.
      </p>

    </div>


    {/* Step 3 */}
    <div className="step-card">

      <div className="step-number">
        03
      </div>

      <div className="step-icon">
        🚀
      </div>

      <h3>Submit Test</h3>

      <p>
        Complete your test and submit your answers
        when you are ready.
      </p>

    </div>


    {/* Step 4 */}
    <div className="step-card">

      <div className="step-number">
        04
      </div>

      <div className="step-icon">
        🏆
      </div>

      <h3>Get Your Result</h3>

      <p>
        View your score instantly and understand
        your performance.
      </p>

    </div>

  </div>

</section>
{/* ================= LEADERBOARD ================= */}

<section className="leaderboard-section">

  <div className="section-heading">
    <div className="section-tag">TOP PERFORMERS</div>

    <h2>🏆 Leaderboard</h2>

    <p>
      See how you rank among our top performers.
    </p>
  </div>

  <div className="leaderboard-card">

    {/* Header */}
    <div className="leaderboard-header">
      <span>Rank</span>
      <span>Student</span>
      <span>Tests</span>
      <span>Best Score</span>
    </div>

    {/* Loading */}
    {leaderboardLoading && (
      <div className="leaderboard-empty">
        Loading leaderboard...
      </div>
    )}

    {/* No Data */}
    {!leaderboardLoading && leaderboard.length === 0 && (
      <div className="leaderboard-empty">
        <div className="empty-icon">🏆</div>

        <h3>No Scores Yet</h3>

        <p>
          Be the first student to complete a test!
        </p>

        <Link to="/tests">
          Start Your Test →
        </Link>
      </div>
    )}

    {/* Database Data */}
    {!leaderboardLoading &&
      leaderboard.map((student, index) => (

        <div
          className={`leaderboard-row ${
            index === 0 ? "first" : ""
          }`}
          key={student.id}
        >

          {/* Rank */}
          <div className="rank">

            {index === 0 && "🥇"}

            {index === 1 && "🥈"}

            {index === 2 && "🥉"}

            {index > 2 && (
              <span>{index + 1}</span>
            )}

          </div>

          {/* Student */}
          <div className="student-info">

            <div className="student-avatar">
              {student.name
                ? student.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U"}
            </div>

            <div>
              <strong>
                {student.name}
              </strong>

              <small>
                Online Test Student
              </small>
            </div>

          </div>

          {/* Tests */}
          <div className="tests-count">
            {student.tests}
          </div>

          {/* Score */}
          <div className="score">
            {Number(student.bestScore || 0).toFixed(2)}%
          </div>

        </div>

      ))}

  </div>

  <div className="leaderboard-footer">
    <Link to="/dashboard">
      View Your Performance →
    </Link>
  </div>

</section>
      {/* ================= CTA ================= */}

      <section className="cta">
        <div>
          <h2>Ready to Test Your Knowledge?</h2>
          <p>
            Start your preparation today and improve your score.
          </p>
        </div>

        <Link to="/register">
          Start Your First Test →
        </Link>
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <div className="footer-logo">
          🎓 TestHub
        </div>

        <p>
          © 2026 TestHub. All rights reserved.
        </p>
      </footer>

    </>
  );
}

/* ================= LOGIN ================= */

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setMessage("Login successful!");
        setMessageType("success");

        setTimeout(() => {
  if (data.user?.role === "admin") {
    window.location.href = "/admin";
  } else {
    window.location.href = "/";
  }
}, 700);
      } else {
        setMessage(
          data.message ||
          "Invalid email or password."
        );

        setMessageType("error");
      }

    } catch (error) {
      console.log(error);

      setMessage(
        "We're having trouble signing you in."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">

      {/* ================= HEADER ================= */}

      <header className="login-header">

        <Link
          to="/"
          className="login-brand"
        >
          <span className="brand-cap">
            🎓
          </span>

          <span>
            Test<span>Hub</span>
          </span>
        </Link>


        <div className="login-header-right">

          <span>
            New here?
          </span>

          <Link
            to="/register"
            className="header-signup"
          >
            Sign Up
          </Link>

        </div>

      </header>


      {/* ================= BACKGROUND ================= */}

      <div className="login-decoration decoration-one"></div>

      <div className="login-decoration decoration-two"></div>

      <div className="login-decoration decoration-three"></div>


      {/* ================= MAIN ================= */}

      <main className="login-main">


        {/* ================= LEFT SIDE ================= */}

        <section className="login-intro">

          <div className="intro-pill">

            <span>
              Learn
            </span>

            <b>•</b>

            <span>
              Practice
            </span>

            <b>•</b>

            <span>
              Grow
            </span>

          </div>


          <h1>
            Welcome
            <br />
            <span>
              Back!
            </span>
          </h1>


          <p className="intro-description">
            Login to continue your learning
            <br />
            journey and achieve your goals.
          </p>


          {/* FEATURE 1 */}

          <div className="login-feature">

            <div className="feature-icon">
              📖
            </div>

            <div>

              <strong>
                Take Online Tests
              </strong>

              <span>
                Practice and improve
              </span>

            </div>

          </div>


          {/* FEATURE 2 */}

          <div className="login-feature">

            <div className="feature-icon">
              📊
            </div>

            <div>

              <strong>
                Track Progress
              </strong>

              <span>
                See your growth
              </span>

            </div>

          </div>


          {/* FEATURE 3 */}

          <div className="login-feature">

            <div className="feature-icon">
              🏆
            </div>

            <div>

              <strong>
                Achieve Goals
              </strong>

              <span>
                Be exam ready
              </span>

            </div>

          </div>


          {/* QUOTE */}

          <div className="login-quote">

            <p>
              “A little progress each day
              <br />
              adds up to big results.”
            </p>

            <span>
              <b>—</b>
              Keep Going
            </span>

          </div>

        </section>


        {/* ================= LOGIN CARD ================= */}

        <section className="login-box">


          {/* CARD LOGO */}

          <div className="login-card-logo">

            <span className="card-logo-icon">
              🎓
            </span>

            <span>
              Test<span>Hub</span>
            </span>

          </div>


          {/* TITLE */}

          <div className="login-title">

            <h2>
              Welcome Back
              <span> 👋</span>
            </h2>

            <p>
              Login to continue your learning journey
            </p>

          </div>


          <form onSubmit={handleSubmit}>


            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="login-input-box">

                <span className="field-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-input-box">

                <span className="field-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>


            {/* REMEMBER / FORGOT */}

            <div className="login-options">

              <label>

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>


              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>


            {/* ALERT */}

            {message && (

              <div
                className={
                  messageType === "success"
                    ? "login-alert login-alert-success"
                    : "login-alert login-alert-error"
                }
              >

                <div className="alert-icon">

                  {messageType === "success"
                    ? "✓"
                    : "!"}

                </div>


                <div className="alert-text">

                  <strong>

                    {messageType === "success"
                      ? "Login Successful"
                      : "We're having trouble signing you in."}

                  </strong>

                  <span>

                    {messageType === "success"
                      ? "Redirecting you..."
                      : "Please check your connection and try again."}

                  </span>

                </div>


                <button
                  type="button"
                  className="alert-close"
                  onClick={() => {
                    setMessage("");
                    setMessageType("");
                  }}
                >
                  ×
                </button>

              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="login-loader"></span>
                  Signing in...
                </>

              ) : (

                <>
                  Login
                  <span>→</span>
                </>

              )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="login-divider">

            <span></span>

            <p>
              OR CONTINUE WITH
            </p>

            <span></span>

          </div>


          {/* ================= GOOGLE / MICROSOFT ================= */}

            <div className="social-login">

           {/* GOOGLE */}

            <button
            type="button"
        className="social-button"
        onClick={() =>
      setMessage(
        "Google login will be available soon."
      )
    }
  >

    <svg
      className="google-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.4Z"
      />

      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.7Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.79A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.22.31-1.79V7.68H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.32l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.3 14.63 2.3 12 2.3a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 7.9 9.46 6.18 12 6.18Z"
      />
    </svg>

    <span>
      Continue with Google
    </span>

  </button>


  {/* MICROSOFT */}

  <button
    type="button"
    className="social-button"
    onClick={() =>
      setMessage(
        "Microsoft login will be available soon."
      )
    }
  >

    <svg
      className="microsoft-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >

      <rect
        x="2"
        y="2"
        width="9"
        height="9"
        fill="#F25022"
      />

      <rect
        x="13"
        y="2"
        width="9"
        height="9"
        fill="#7FBA00"
      />

      <rect
        x="2"
        y="13"
        width="9"
        height="9"
        fill="#00A4EF"
      />

      <rect
        x="13"
        y="13"
        width="9"
        height="9"
        fill="#FFB900"
      />

    </svg>

    <span>
      Continue with Microsoft
    </span>

  </button>

</div>


          {/* CARD BOTTOM */}

          <div className="login-card-bottom">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Sign Up
            </Link>

          </div>


          {/* SECURITY */}

          <div className="login-security">

            <span>
              🔐
            </span>

            <span>
              Your information is secure
            </span>

          </div>

        </section>

      </main>


      {/* ================= RIGHT FLOATING CARD ================= */}

      <div className="login-future-card">

        <div>
          Better
        </div>

        <div>
          Questions
        </div>

        <div>
          Brighter
        </div>

        <div>
          Futures
        </div>

        <span></span>

      </div>


      {/* ================= MOTIVATION ================= */}

      <div className="login-motivation">
        You Can Do It ♥
      </div>

    </div>
  );
}

/* ================= TEST PAGE ================= */

function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  /* ================= LOAD TEST ================= */

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tests/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load test"
          );
        }

        setTest(data.test || null);
        setQuestions(data.questions || []);

        const duration = Number(data.test?.duration) || 30;
        setTimeLeft(duration * 60);
      } catch (error) {
        console.error("Test loading error:", error);
        setTest(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (loading || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft]);

  /* ================= AUTO SUBMIT ================= */

  useEffect(() => {
    if (
      timeLeft === 0 &&
      questions.length > 0 &&
      !loading &&
      !submitting
    ) {
      handleTestSubmit(true);
    }
  }, [timeLeft]);

  /* ================= FORMAT TIME ================= */

  const formatTime = (seconds) => {
    const totalSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  /* ================= SELECT ANSWER ================= */

  const selectAnswer = (answer) => {
    const questionId = questions[currentQuestion]?.id;

    if (!questionId) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  /* ================= MARK REVIEW ================= */

  const toggleMark = () => {
    const questionId = questions[currentQuestion]?.id;

    if (!questionId) return;

    setMarked((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((item) => item !== questionId);
      }

      return [...prev, questionId];
    });
  };

  /* ================= SUBMIT ================= */

  const handleTestSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    if (!autoSubmit) {
      const confirmed = window.confirm(
        "Are you sure you want to submit the test?"
      );

      if (!confirmed) return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const totalTime =
        (Number(test?.duration) || 0) * 60 - timeLeft;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tests/${id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
            timeTaken: Math.max(0, totalTime),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit test"
        );
      }

      if (data.resultId) {
        navigate(`/result/${data.resultId}`);
      } else {
        throw new Error("Result ID was not returned by server.");
      }
    } catch (error) {
      console.error("Submit Test Error:", error);
      alert(error.message || "Unable to submit test.");
      setSubmitting(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="loading-page">
        Loading Test...
      </div>
    );
  }

  /* ================= NOT FOUND ================= */

  if (!test || questions.length === 0) {
    return (
      <div className="loading-page">
        <h2>Test not found.</h2>
        <p>
          This test does not exist or no questions have been added yet.
        </p>
        <button
          className="primary-btn"
          onClick={() => navigate("/tests")}
        >
          ← Back to Tests
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = answers[question.id];
  const isMarked = marked.includes(question.id);

  return (
    <div className="exam-page">
      {/* ================= HEADER ================= */}

      <header className="exam-header">
        <Link to="/dashboard" className="exam-logo">
          🎓 TestHub
        </Link>

        <div className="exam-title">
          <strong>{test.title}</strong>
          <span>{test.category}</span>
        </div>

        <div
          className={`exam-timer ${timeLeft <= 60 ? "danger" : ""}`}
        >
          ⏱️ {formatTime(timeLeft)}
        </div>
      </header>

      {/* ================= BODY ================= */}

      <main className="exam-container">
        <div className="exam-main">
          {/* PROGRESS */}

          <div className="question-top">
            <div>
              Question <strong>{currentQuestion + 1}</strong> of{" "}
              <strong>{questions.length}</strong>
            </div>

            <div>
              {answeredCount}/{questions.length} Answered
            </div>
          </div>

          {/* QUESTION CARD */}

          <div className="question-card">
            <div className="question-number">
              Question {currentQuestion + 1}
            </div>

            <h2>{question.question}</h2>

            <div className="options">
              {[
                ["A", question.option_a],
                ["B", question.option_b],
                ["C", question.option_c],
                ["D", question.option_d],
              ].map(([letter, text]) => (
                <button
                  key={letter}
                  type="button"
                  className={`option ${
                    isAnswered === letter ? "selected" : ""
                  }`}
                  onClick={() => selectAnswer(letter)}
                >
                  <span className="option-letter">{letter}</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTROLS */}

          <div className="question-controls">
            <button
              type="button"
              className="previous-btn"
              disabled={currentQuestion === 0}
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
            >
              ← Previous
            </button>

            <button
              type="button"
              className={`review-btn ${isMarked ? "marked" : ""}`}
              onClick={toggleMark}
            >
              🚩 {isMarked ? "Marked" : "Mark for Review"}
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                type="button"
                className="submit-test-btn"
                onClick={() => handleTestSubmit(false)}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Test ✓"}
              </button>
            ) : (
              <button
                type="button"
                className="next-btn"
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* QUESTION PALETTE */}

        <aside className="question-sidebar">
          <div className="palette-card">
            <h3>Question Palette</h3>

            <div className="palette-grid">
              {questions.map((q, index) => {
                const answered = answers[q.id];
                const review = marked.includes(q.id);

                return (
                  <button
                    type="button"
                    key={q.id}
                    className={`palette-btn
                      ${currentQuestion === index ? "active" : ""}
                      ${answered ? "answered" : ""}
                      ${review ? "review" : ""}
                    `}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div>
                <span className="legend answered"></span>
                Answered
              </div>

              <div>
                <span className="legend review"></span>
                Review
              </div>

              <div>
                <span className="legend"></span>
                Not Answered
              </div>
            </div>
          </div>

          <div className="submit-box">
            <p>
              {questions.length - answeredCount} questions remaining
            </p>

            <button
              type="button"
              onClick={() => handleTestSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ================= RESULT PAGE ================= */

function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/results/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch result");
        }

        setResultData(data);
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-page">
        Loading Result...
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <h2>Unable to load result</h2>
        <p>{error}</p>

        <button
          className="primary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const result = resultData?.result;
  const answers = resultData?.answers || [];

  if (!result) {
    return (
      <div className="loading-page">
        Result not found.
      </div>
    );
  }

  /* ================= CALCULATIONS ================= */

  const correctCount = Number(result.score) || 0;

  const answeredCount = answers.filter(
    (item) => item.selected_answer
  ).length;

  const totalQuestions =
    Number(result.total_questions) || answers.length;

  const wrongCount =
    answeredCount - correctCount;

  const unattemptedCount =
    totalQuestions - answeredCount;

  const percentage = Number(result.percentage) || 0;

  /* ================= TIME ================= */

  const formatTime = (seconds) => {
    const totalSeconds = Number(seconds) || 0;

    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}:${String(secs).padStart(2, "0")}`;
    }

    return `0:${String(secs).padStart(2, "0")}`;
  };

  /* ================= OPTION TEXT ================= */

  const getOptionText = (item, letter) => {
    if (!letter) return "Not Attempted";

    const options = {
      A: item.option_a,
      B: item.option_b,
      C: item.option_c,
      D: item.option_d,
    };

    return options[letter] || letter;
  };

  /* ================= PERFORMANCE ================= */

  let performance = "Keep Practicing! 💪";

  if (percentage >= 80) {
    performance = "Excellent performance! 🏆";
  } else if (percentage >= 60) {
    performance = "Good performance! 👍";
  } else if (percentage >= 40) {
    performance = "Nice effort! 📚";
  }

  return (
    <div className="result-page">

      {/* ================= NAVBAR ================= */}

      <Navbar />

      {/* ================= RESULT HEADER ================= */}

      <main className="result-container">

        <div className="result-header">

          <div className="success-icon">
            ✓
          </div>

          <h1>Test Completed!</h1>

          <p>
            Great job, {result.user_name}! 🎉
          </p>

          <strong>
            {result.test_title}
          </strong>

        </div>

        {/* ================= MAIN SCORE ================= */}

        <div className="result-main-card">

          <div className="score-circle">
            <div>
              <strong>
                {Math.round(percentage)}%
              </strong>

              <span>
                Score
              </span>
            </div>
          </div>

          <div className="score-info">

            <h2>
              {correctCount} / {totalQuestions}
            </h2>

            <p>
              Correct Answers
            </p>

            <div className="performance-badge">
              {performance}
            </div>

          </div>

        </div>

        {/* ================= STATS ================= */}

        <div className="result-stats">

          <div className="result-stat correct">
            <div className="result-stat-icon">
              ✓
            </div>

            <div>
              <small>Correct</small>
              <strong>{correctCount}</strong>
            </div>
          </div>

          <div className="result-stat wrong">
            <div className="result-stat-icon">
              ✕
            </div>

            <div>
              <small>Wrong</small>
              <strong>{wrongCount}</strong>
            </div>
          </div>

          <div className="result-stat unattempted">
            <div className="result-stat-icon">
              —
            </div>

            <div>
              <small>Unattempted</small>
              <strong>{unattemptedCount}</strong>
            </div>
          </div>

          <div className="result-stat time">
            <div className="result-stat-icon">
              ⏱
            </div>

            <div>
              <small>Time Taken</small>
              <strong>
                {formatTime(result.time_taken)}
              </strong>
            </div>
          </div>

        </div>

        {/* ================= BUTTONS ================= */}

        <div className="result-actions">

          <button
            className="retake-btn"
            onClick={() =>
              navigate(`/test/${result.test_id}`)
            }
          >
            ↻ Retake Test
          </button>

          <button
            className="dashboard-result-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Go to Dashboard →
          </button>

        </div>

        {/* ================= ANSWER REVIEW ================= */}

        <section className="answer-review">

          <div className="answer-review-heading">

            <div className="section-tag">
              ANSWER REVIEW
            </div>

            <h2>
              Check Your Answers
            </h2>

            <p>
              Review your answers and see the correct solutions.
            </p>

          </div>

          <div className="answer-list">

            {answers.map((item, index) => {

              const selected =
                item.selected_answer;

              const correct =
                item.correct_answer;

              const isCorrect =
                selected === correct;

              const isUnattempted =
                !selected;

              return (
                <div
                  className={`answer-card ${
                    isUnattempted
                      ? "unattempted-card"
                      : isCorrect
                      ? "correct-card"
                      : "wrong-card"
                  }`}
                  key={item.id}
                >

                  <div className="answer-card-top">

                    <span className="question-label">
                      Question {index + 1}
                    </span>

                    <span
                      className={`answer-status ${
                        isUnattempted
                          ? "status-unattempted"
                          : isCorrect
                          ? "status-correct"
                          : "status-wrong"
                      }`}
                    >
                      {isUnattempted
                        ? "Not Attempted"
                        : isCorrect
                        ? "Correct ✓"
                        : "Wrong ✕"}
                    </span>

                  </div>

                  <h3>
                    {item.question}
                  </h3>

                  <div className="answer-options">

                    <div
                      className={
                        selected === "A"
                          ? "selected-option"
                          : correct === "A"
                          ? "correct-option"
                          : ""
                      }
                    >
                      <span>A</span>
                      {item.option_a}
                    </div>

                    <div
                      className={
                        selected === "B"
                          ? "selected-option"
                          : correct === "B"
                          ? "correct-option"
                          : ""
                      }
                    >
                      <span>B</span>
                      {item.option_b}
                    </div>

                    <div
                      className={
                        selected === "C"
                          ? "selected-option"
                          : correct === "C"
                          ? "correct-option"
                          : ""
                      }
                    >
                      <span>C</span>
                      {item.option_c}
                    </div>

                    <div
                      className={
                        selected === "D"
                          ? "selected-option"
                          : correct === "D"
                          ? "correct-option"
                          : ""
                      }
                    >
                      <span>D</span>
                      {item.option_d}
                    </div>

                  </div>

                  <div className="answer-result-row">

                    <div>
                      <strong>Your Answer:</strong>{" "}
                      {selected
                        ? `${selected} - ${getOptionText(
                            item,
                            selected
                          )}`
                        : "Not Attempted"}
                    </div>

                    <div>
                      <strong>Correct Answer:</strong>{" "}
                      {correct} -{" "}
                      {getOptionText(item, correct)}
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </main>

    </div>
  );
}

/* ================= ROUTES ================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

  <Route
    path="/"
    element={<Home />}
  />

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />
  <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

  <Route
    path="/tests"
    element={<Tests />}
  />

  <Route
    path="/test/:id"
    element={<TestPage />}
  />

<Route
  path="/result/:id"
  element={<ResultPage />}
/>

<Route
  path="/results"
  element={<Results />}
/>

  <Route
    path="/dashboard"
    element={<Dashboard />}
  />
<Route path="/admin" element={<AdminDashboard />} />

<Route
  path="/admin/users"
  element={<AdminUsers />}
/>

<Route
  path="/admin/tests"
  element={<AdminTests />}
/>

<Route
  path="/test-instructions/:testId"
  element={<TestInstructions />}
/>

<Route
  path="/admin/tests/:testId/questions"
  element={<AdminQuestions />}
/>

<Route
  path="/admin/questions"
  element={<AllQuestions />}
/>

<Route
  path="/admin/results"
  element={<AdminResults />}
/>

<Route
  path="/admin/notifications"
  element={<AdminNotifications />}
/>

<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/account" element={<Account />} />

<Route
  path="/certificates"
  element={<Certificates />}
/>

<Route
  path="/certificate/:resultId"
  element={<Certificate />}
/>

<Route
  path="/admin/certificates"
  element={<AdminCertificates />}
/>

<Route
  path="/verify-certificate/:certificateId"
  element={<VerifyCertificate />}
/>

</Routes>
 <AIAssistant />
    </BrowserRouter>
    
  );
}

export default App;
