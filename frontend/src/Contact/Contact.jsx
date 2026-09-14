import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Contact.css";

const API_URL = "${import.meta.env.VITE_API_URL}";

const faqs = [
  {
    q: "How quickly will I receive a response?",
    a: "We normally respond to contact requests as soon as possible. Send your question through the form and our support team will review it.",
  },
  {
    q: "Can I report a problem with a test?",
    a: "Yes. Tell us the test name, the problem you faced, and any useful details so our team can help.",
  },
  {
    q: "Can I ask about my certificate?",
    a: "Yes. Include your test name or certificate details in your message and our team will help you.",
  },
  {
    q: "Can I contact TestHub from mobile?",
    a: "Yes. TestHub is responsive and the Contact Us page works on mobile, tablet, and desktop.",
  },
];

function Contact() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    email: "support6396@gmail.com",
    phone: "+91 6396200316",
    location: "Haridwar, Uttarakhand, India",
    hours: "24/7 Online Support",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    text: "",
  });

  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    setIsLoggedIn(Boolean(token));

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setFormData((prev) => ({
          ...prev,
          name: user.name || user.full_name || "",
          email: user.email || "",
        }));
      } catch {
        // Ignore invalid localStorage
      }
    }

    fetch(`${API_URL}/api/contact/info`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed");
        }

        return res.json();
      })
      .then((data) => {
        setContactInfo((prev) => ({
          ...prev,
          ...data,
        }));
      })
      .catch(() => {
        // Keep default data
      });
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    closeMenu();

    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (alert.text) {
      setAlert({
        type: "",
        text: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert({
      type: "",
      text: "",
    });

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      setAlert({
        type: "error",
        text: "Please fill in all fields.",
      });

      return;
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setAlert({
        type: "error",
        text: "Please enter a valid Gmail address.",
      });

      return;
    }

    if (message.length < 10) {
      setAlert({
        type: "error",
        text: "Message must contain at least 10 characters.",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send your message."
        );
      }

      setAlert({
        type: "success",
        text:
          data.message ||
          "Your message has been sent successfully!",
      });

      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error) {
      setAlert({
        type: "error",
        text:
          error.message ||
          "Unable to send your message.",
      });
    } finally {
      setLoading(false);
    }
  };

  const phoneHref = `tel:${String(contactInfo.phone).replace(
    /[^\d+]/g,
    ""
  )}`;

  return (
    <div className="contact-page">

      {/* ================= NAVBAR ================= */}

      <header className="contact-navbar">

        <Link
          to="/"
          className="contact-logo"
          onClick={closeMenu}
        >
          <span className="contact-logo-mark">
            🎓
          </span>

          <span className="contact-logo-text">
            <strong>TestHub</strong>
            <small>Learn • Practice • Grow</small>
          </span>
        </Link>

        <nav
          className={`contact-nav-links ${
            menuOpen ? "mobile-open" : ""
          }`}
        >
          <NavLink
            to="/"
            end
            className="contact-nav-link"
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/tests"
            className="contact-nav-link"
            onClick={closeMenu}
          >
            Tests
          </NavLink>

          <NavLink
            to="/about"
            className="contact-nav-link"
            onClick={closeMenu}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className="contact-nav-link"
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          <NavLink
            to="/dashboard"
            className="contact-nav-link"
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>

          <div className="contact-mobile-auth">
            {isLoggedIn ? (
              <button
                className="contact-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="contact-login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="contact-signup"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="contact-desktop-auth">
          {isLoggedIn ? (
            <button
              className="contact-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="contact-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="contact-signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`contact-hamburger ${
            menuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

      </header>

      {/* ================= HERO ================= */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <span className="contact-label">
            CONTACT US
          </span>

          <h1>
            We'd love to
            <br />
            <strong>hear from you.</strong> 👋
          </h1>

          <p>
            Have a question, suggestion or need help?
            Our team is here to help you get the most
            out of TestHub.
          </p>

          <div className="contact-hero-actions">

            <a
              href="#contact-form"
              className="contact-hero-primary"
            >
              ✈ &nbsp; Send a Message
              <span>→</span>
            </a>

            <a
              href={phoneHref}
              className="contact-hero-secondary"
            >
              ☎ &nbsp; Call Us
            </a>

          </div>

        </div>

        <div className="contact-hero-visual">

          <div className="contact-orbit orbit-one" />
          <div className="contact-orbit orbit-two" />
          <div className="contact-orbit orbit-three" />

          <div className="contact-paper-plane">
            ➤
          </div>

          <div className="contact-message-bubble">
            •••
          </div>

          <div className="contact-message-card">

            <div className="contact-card-top">
              <span>TESTHUB</span>
              <span>SUPPORT</span>
            </div>

            <div className="contact-card-icon">
              ✉
            </div>

            <strong>
              We're here
              <br />
              to help.
            </strong>

            <small>
              Ask us anything about TestHub.
            </small>

          </div>

          <div className="contact-reply-note">
            <span>↩</span>

            <strong>
              We reply
              <br />
              fast!
            </strong>
          </div>

          <div className="contact-floating-support">

            <span className="support-icon">
              👥
            </span>

            <strong>
              24/7 Support
            </strong>

            <small>
              We're always here
              <br />
              to help you.
            </small>

          </div>

        </div>

      </section>

      {/* ================= INFO CARDS ================= */}

      <section className="contact-info-section">

        <div className="contact-info-grid">

          <a
            href={`mailto:${contactInfo.email}`}
            className="contact-info-card"
          >
            <div className="contact-info-icon email-icon">
              ✉
            </div>

            <div className="contact-info-content">
              <span>Email</span>
              <strong>{contactInfo.email}</strong>
              <small>
                Drop us an email anytime
              </small>
            </div>
          </a>

          <a
            href={phoneHref}
            className="contact-info-card"
          >
            <div className="contact-info-icon phone-icon">
              ☎
            </div>

            <div className="contact-info-content">
              <span>Phone</span>
              <strong>{contactInfo.phone}</strong>
              <small>
                Mon - Sun, 24/7
              </small>
            </div>
          </a>

          <div className="contact-info-card">

            <div className="contact-info-icon location-icon">
              ●
            </div>

            <div className="contact-info-content">
              <span>Location</span>
              <strong>{contactInfo.location}</strong>
              <small>
                Visit us anytime
              </small>
            </div>

          </div>

          <div className="contact-info-card">

            <div className="contact-info-icon availability-icon">
              ◷
            </div>

            <div className="contact-info-content">
              <span>Availability</span>
              <strong>{contactInfo.hours}</strong>
              <small>
                We're always here
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* ================= MAIN ================= */}

      <main
        className="contact-main"
        id="contact-form"
      >

        {/* FORM */}

        <div className="contact-form-wrapper">

          <div className="contact-section-heading">

            <span>GET IN TOUCH</span>

            <h2>
              Send us a{" "}
              <strong>message</strong>
            </h2>

            <p>
              Fill out the form below and our team
              will get back to you as soon as possible.
            </p>

          </div>

          {alert.text && (
            <div
              className={`contact-alert ${alert.type}`}
            >
              <span>
                {alert.type === "success"
                  ? "✓"
                  : "!"}
              </span>

              <p>{alert.text}</p>
            </div>
          )}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="contact-form-row">

              <div className="contact-field">

                <label htmlFor="contact-name">
                  Your Name
                </label>

                <div className="contact-input-wrap">
                  <span>♙</span>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    maxLength={100}
                  />
                </div>

              </div>

              <div className="contact-field">

                <label htmlFor="contact-email">
                  Gmail Address
                </label>

                <div className="contact-input-wrap">
                  <span>✉</span>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    maxLength={150}
                  />
                </div>

              </div>

            </div>

            <div className="contact-field">

              <label htmlFor="contact-subject">
                Subject
              </label>

              <div className="contact-input-wrap">
                <span>▤</span>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What can we help you with?"
                  maxLength={255}
                />
              </div>

            </div>

            <div className="contact-field">

              <label htmlFor="contact-message">
                Message
              </label>

              <div className="contact-textarea-wrap">

                <span>▢</span>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  maxLength={2000}
                  rows={6}
                />

                <small>
                  {formData.message.length}/2000
                </small>

              </div>

            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="contact-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  ✈ &nbsp; Send Message
                  <span>→</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* SUPPORT CARD */}

        <aside className="contact-side">

          <div className="contact-side-card">

            <span className="contact-side-label">
              NEED HELP?
            </span>

            <h3>
              We're here
              <br />
              for you
            </h3>

            <div className="contact-headphone">
              ♧
            </div>

            <div className="contact-side-line" />

            <p>
              Whether you are facing a technical issue,
              have feedback or simply want to say hello,
              feel free to reach out. Our team will get
              back to you as soon as possible.
            </p>

            <ul>

              <li>
                <span>✓</span>
                Quick Response
              </li>

              <li>
                <span>✓</span>
                Friendly Support
              </li>

              <li>
                <span>✓</span>
                Problem Solving
              </li>

              <li>
                <span>✓</span>
                Your Success Matters
              </li>

            </ul>

            <div className="contact-support-location">

              <div className="contact-support-location-icon">
                👥
              </div>

              <div>
                <strong>
                  TestHub Support
                </strong>

                <small>
                  {contactInfo.location}
                </small>
              </div>

              <b>›</b>

            </div>

          </div>

        </aside>

      </main>

      {/* ================= FAQ ================= */}

      <section className="contact-faq">

        <div className="contact-section-heading center">

          <span>FAQ</span>

          <h2>
            Frequently asked{" "}
            <strong>questions</strong>
          </h2>

          <p>
            Find quick answers to common questions.
          </p>

        </div>

        <div className="contact-faq-list">

          {faqs.map((faq, index) => {

            const isOpen = openFaq === index;

            return (
              <div
                className={`contact-faq-item ${
                  isOpen ? "open" : ""
                }`}
                key={faq.q}
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(
                      isOpen ? -1 : index
                    )
                  }
                >

                  <span>{faq.q}</span>

                  <strong>
                    {isOpen ? "−" : "+"}
                  </strong>

                </button>

                {isOpen && (
                  <div className="contact-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="contact-cta">

        <div>

          <span>
            STILL NEED HELP?
          </span>

          <h2>
            Let's solve it{" "}
            <strong>together.</strong>
          </h2>

          <p>
            Your questions and feedback help us
            make TestHub better.
          </p>

        </div>

        <a
          href={`mailto:${contactInfo.email}`}
          className="contact-cta-btn"
        >
          Email Support
          <span>→</span>
        </a>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="contact-footer">

        <div className="contact-footer-brand">

          <div>
            <span>🎓</span>
            <strong>TestHub</strong>
          </div>

          <p>
            Learn • Practice • Grow
          </p>

        </div>

        <div className="contact-footer-links">

          <Link to="/">Home</Link>
          <Link to="/tests">Tests</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

        </div>

        <div className="contact-footer-social">

          <span>●</span>
          <span>♥</span>
          <span>in</span>
          <span>◎</span>
          <span>▶</span>

          <small>
            © 2026 TestHub. All rights reserved.
          </small>

        </div>

      </footer>

    </div>
  );
}

export default Contact;
