import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const API = "http://localhost:5000/api";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));

    setMessage("");
    setMessageType("");
  };

  const showError = (msg) => {
    setMessage(msg);
    setMessageType("error");
  };

  const showSuccess = (msg) => {
    setMessage(msg);
    setMessageType("success");
  };

  // ================= SEND OTP =================
  const sendOTP = async (e) => {
    e.preventDefault();

    const name = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name) {
      showError("Please enter your full name.");
      return;
    }

    if (name.length < 3) {
      showError("Full name must contain at least 3 characters.");
      return;
    }

    if (!email) {
      showError("Please enter your Gmail address.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      showError("Please use a valid Gmail address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/register/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Unable to send OTP.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        fullName: name,
        email,
        otp: "",
      }));

      showSuccess("OTP sent successfully to your Gmail.");

      setTimeout(() => {
        setMessage("");
        setStep(2);
      }, 700);
    } catch (error) {
      console.error(error);
      showError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOTP = async (e) => {
    e.preventDefault();

    const otp = formData.otp.trim();

    if (otp.length !== 6) {
      showError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/register/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Invalid or expired OTP.");
        return;
      }

      showSuccess("Gmail verified successfully.");

      setTimeout(() => {
        setMessage("");
        setStep(3);
      }, 700);
    } catch (error) {
      console.error(error);
      showError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE ACCOUNT =================
  const createAccount = async (e) => {
    e.preventDefault();

    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!password) {
      showError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      showError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      showError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  name: formData.fullName,
  email: formData.email,
  password,
  confirmPassword,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Unable to create account.");
        return;
      }

      // Final success screen
      setStep(4);
      setMessage("");
    } catch (error) {
      console.error(error);
      showError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOTP = async () => {
    const email = formData.email.trim().toLowerCase();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/register/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Unable to resend OTP.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        otp: "",
      }));

      showSuccess("A new OTP has been sent to your Gmail.");
    } catch (error) {
      console.error(error);
      showError("Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUCCESS SCREEN =================
  if (step === 4) {
    return (
      <div className="register-page">
        <div className="register-bg-shape shape-one"></div>
        <div className="register-bg-shape shape-two"></div>

        <header className="register-header">
          <Link to="/" className="register-brand">
            <span className="brand-icon">🎓</span>
            <span>
              Test<span>Hub</span>
            </span>
          </Link>

          <Link to="/login" className="header-login">
            Login
          </Link>
        </header>

        <main className="register-main success-main">
          <div className="success-card">
            <div className="success-icon">
              ✓
            </div>

            <h1>Registration successful!</h1>

            <div className="success-line"></div>

            <p>
              Your account has been created successfully.
            </p>

            <button
              className="register-btn success-btn"
              onClick={() => navigate("/login")}
            >
              Continue to Login
              <span>→</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Background */}
      <div className="register-bg-shape shape-one"></div>
      <div className="register-bg-shape shape-two"></div>
      <div className="register-bg-shape shape-three"></div>

      {/* Header */}
      <header className="register-header">
        <Link to="/" className="register-brand">
          <span className="brand-icon">🎓</span>

          <span className="brand-text">
            Test<span>Hub</span>
          </span>
        </Link>

        <div className="register-header-right">
          <span>Already have an account?</span>

          <Link to="/login" className="header-login">
            Login
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="register-main">

        {/* Left Content */}
        <section className="register-intro">
          <div className="intro-label">
            JOIN TESTHUB
          </div>

          <h1>
            Start Your
            <br />
            <span>Learning Journey</span>
          </h1>

          <p>
            Create your free account and start practicing
            online tests to improve your knowledge and skills.
          </p>

          <div className="register-benefits">

            <div className="benefit-item">
              <div className="benefit-icon">📝</div>

              <div>
                <strong>Practice Tests</strong>
                <span>Improve your preparation</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">📊</div>

              <div>
                <strong>Track Progress</strong>
                <span>Monitor your performance</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">🏆</div>

              <div>
                <strong>Earn Certificates</strong>
                <span>Showcase your achievements</span>
              </div>
            </div>

          </div>

          <div className="register-quote">
            <span>“</span>
            <p>
              Learn today. Practice every day.
              <br />
              Grow tomorrow.
            </p>
          </div>
        </section>

        {/* Register Card */}
        <section className="register-card">

          {/* Card Header */}
          <div className="register-card-header">
            <div className="card-icon">🎓</div>

            <div>
              <h2>
                {step === 1 && "Create Account"}
                {step === 2 && "Verify Gmail"}
                {step === 3 && "Create Password"}
              </h2>

              <p>
                {step === 1 && "Enter your details to get started"}
                {step === 2 && "Verify your email address"}
                {step === 3 && "Secure your TestHub account"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-wrapper">

            <div className="progress-line">
              <div
                className={`progress-fill progress-${step}`}
              ></div>
            </div>

            <div className="progress-steps">

              <div className={step >= 1 ? "progress-step active" : "progress-step"}>
                <span>1</span>
                <small>Details</small>
              </div>

              <div className={step >= 2 ? "progress-step active" : "progress-step"}>
                <span>2</span>
                <small>Verify</small>
              </div>

              <div className={step >= 3 ? "progress-step active" : "progress-step"}>
                <span>3</span>
                <small>Password</small>
              </div>

            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`register-message ${
                messageType === "success"
                  ? "message-success"
                  : "message-error"
              }`}
            >
              <span>
                {messageType === "success" ? "✓" : "!"}
              </span>

              {message}
            </div>
          )}

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <form onSubmit={sendOTP}>

              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">👤</span>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Gmail Address
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    autoComplete="email"
                  />
                </div>

                <small className="input-hint">
                  We'll send a verification OTP to this email.
                </small>
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification OTP
                    <span>→</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <form onSubmit={verifyOTP}>

              <div className="email-confirmed">
                <div className="email-check">✓</div>

                <div>
                  <span>OTP sent to</span>
                  <strong>{formData.email}</strong>
                </div>
              </div>

              <div className="form-group otp-group">
                <label htmlFor="otp">
                  Enter 6-Digit OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="otp-input"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />

                <small className="input-hint otp-hint">
                  OTP is valid for a limited time.
                </small>
              </div>

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Gmail
                    <span>✓</span>
                  </>
                )}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setMessage("");
                  }}
                  className="back-btn"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  onClick={resendOTP}
                  className="resend-btn"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

            </form>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <form onSubmit={createAccount}>

              <div className="verified-email">
                <span>✓</span>

                <div>
                  <small>Verified Gmail</small>
                  <strong>{formData.email}</strong>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Create Password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label="Toggle password"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <small className="input-hint">
                  Minimum 6 characters.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <label className="terms-check">
                <input type="checkbox" required />

                <span>
                  I agree to the{" "}
                  <Link to="/contact">
                    Terms & Conditions
                  </Link>{" "}
                  of TestHub.
                </span>
              </label>

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="back-btn full-back"
                onClick={() => {
                  setStep(2);
                  setMessage("");
                }}
              >
                ← Back to OTP
              </button>

            </form>
          )}

          <div className="card-footer">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>

        </section>
      </main>
    </div>
  );
}

export default Register;