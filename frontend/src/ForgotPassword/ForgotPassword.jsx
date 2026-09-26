import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();

  // 1 = Email
  // 2 = OTP
  // 3 = New Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  // ==============================
  // STEP 1 - SEND OTP
  // ==============================
  const handleSendOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent successfully to your email.");
        setMessageType("success");

        // OTP page
        setStep(2);
      } else {
        setMessage(data.message || "Something went wrong");
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Backend server se connection nahi ho raha"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STEP 2 - VERIFY OTP
  // ==============================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully.");
        setMessageType("success");

        // New password page
        setStep(3);
      } else {
        setMessage(data.message || "Invalid OTP");
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Backend server se connection nahi ho raha"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STEP 3 - RESET PASSWORD
  // ==============================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Password reset successfully! Redirecting to login..."
        );
        setMessageType("success");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(
          data.message || "Password reset failed."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Backend server se connection nahi ho raha"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        {/* LOGO */}
        <Link to="/" className="forgot-logo">
          🎓 <span>Test<span>Hub</span></span>
        </Link>

        {/* ICON */}
        <div className="forgot-icon">
          {step === 1 && "🔐"}
          {step === 2 && "📩"}
          {step === 3 && "🔑"}
        </div>

        {/* ================================= */}
        {/* STEP 1 - EMAIL */}
        {/* ================================= */}

        {step === 1 && (
          <>
            <h1>Forgot Password?</h1>

            <p className="forgot-subtitle">
              No worries! Enter your registered email address
              and we'll help you reset your password.
            </p>

            <form onSubmit={handleSendOTP}>

              <div className="forgot-field">

                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <div className="forgot-input-box">

                  <span>✉️</span>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your registered email"
                    required
                  />

                </div>

              </div>

              {message && (
                <div
                  className={
                    messageType === "success"
                      ? "forgot-success-message"
                      : "forgot-error"
                  }
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP →"}
              </button>

            </form>
          </>
        )}

        {/* ================================= */}
        {/* STEP 2 - OTP */}
        {/* ================================= */}

        {step === 2 && (
          <>
            <h1>Verify OTP</h1>

            <p className="forgot-subtitle">
              We've sent a 6-digit OTP to
              <br />

              <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>

              <div className="forgot-field">

                <label htmlFor="forgot-otp">
                  Enter OTP
                </label>

                <div className="forgot-input-box">

                  <span>🔢</span>

                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="Enter 6-digit OTP"
                    required
                  />

                </div>

              </div>

              {message && (
                <div
                  className={
                    messageType === "success"
                      ? "forgot-success-message"
                      : "forgot-error"
                  }
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP →"}
              </button>

              {/* CHANGE EMAIL */}
              <button
                type="button"
                className="forgot-back-step"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                  setMessageType("");
                }}
              >
                ← Change Email
              </button>

            </form>
          </>
        )}

        {/* ================================= */}
        {/* STEP 3 - NEW PASSWORD */}
        {/* ================================= */}

        {step === 3 && (
          <>
            <h1>Create New Password</h1>

            <p className="forgot-subtitle">
              OTP verified successfully.
              <br />
              Create a new password for your account.
            </p>

            <form onSubmit={handleResetPassword}>

              {/* NEW PASSWORD */}

              <div className="forgot-field">

                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="forgot-input-box">

                  <span>🔒</span>

                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    required
                  />

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="forgot-field">

                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="forgot-input-box">

                  <span>🔒</span>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    required
                  />

                </div>

              </div>

              {message && (
                <div
                  className={
                    messageType === "success"
                      ? "forgot-success-message"
                      : "forgot-error"
                  }
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading}
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password →"}
              </button>

            </form>
          </>
        )}

        {/* BACK TO LOGIN */}

        <div className="forgot-bottom">

          <Link to="/login">
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;