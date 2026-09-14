import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import "./About.css";


// =====================================================
// SLIDER DATA
// =====================================================

const slides = [
  {
    id: 1,
    tag: "SMART LEARNING",
    title: "Test your knowledge.",
    highlight: "Build your confidence.",
    description:
      "Practice with carefully designed online tests, track your progress and prepare yourself for better opportunities.",
    button: "Explore Tests",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",
  },

  {
    id: 2,
    tag: "PRACTICE • IMPROVE • GROW",
    title: "Turn practice into",
    highlight: "real progress.",
    description:
      "Challenge yourself with structured assessments and discover where you can improve every day.",
    button: "Start Practicing",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
  },

  {
    id: 3,
    tag: "YOUR PERFORMANCE MATTERS",
    title: "Understand your",
    highlight: "strengths & weaknesses.",
    description:
      "Get meaningful results after every test and use your performance data to plan your next step.",
    button: "View Dashboard",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  },
];


// =====================================================
// MAIN COMPONENT
// =====================================================

function About() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [openFaq, setOpenFaq] = useState(0);
  const [stats, setStats] = useState({
  students: 0,
  attempts: 0,
  tests: 0,
  satisfaction: 95,
  access: "24/7",
});

const [statsLoading, setStatsLoading] = useState(true);

  // ===================================================
  // AUTO SLIDER
  // ===================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

// ===================================================
// LIVE ABOUT STATS
// ===================================================

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/about/stats"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();

      setStats({
        students: Number(data.students || 0),
        attempts: Number(data.attempts || 0),
        tests: Number(data.tests || 0),
        satisfaction: Number(data.satisfaction || 95),
        access: data.access || "24/7",
      });
    } catch (error) {
      console.error("About stats error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  fetchStats();
}, []);

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setMenuOpen(false);

    navigate("/login");
  };


  // ===================================================
  // SLIDER CONTROLS
  // ===================================================

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };


  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };


  const goToSlide = (index) => {
    setCurrentSlide(index);
  };


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const slide = slides[currentSlide];


  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="about-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="about-navbar">

        {/* LOGO */}

        <Link
          to="/"
          className="about-logo"
          onClick={closeMenu}
        >
          <span className="about-logo-icon">
            🎓
          </span>

          <span className="about-logo-content">
            <strong>TestHub</strong>
            <small>
              LEARN • PRACTICE • GROW
            </small>
          </span>
        </Link>


        {/* HAMBURGER */}

        <button
          type="button"
          className={`about-hamburger ${
            menuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* NAVIGATION */}

        <div
          className={`about-nav-links ${
            menuOpen ? "mobile-open" : ""
          }`}
        >

          <NavLink
            to="/"
            className="about-nav-link"
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/tests"
            className="about-nav-link"
            onClick={closeMenu}
          >
            Tests
          </NavLink>

          <NavLink
            to="/about"
            className="about-nav-link active"
            onClick={closeMenu}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className="about-nav-link"
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          <NavLink
            to="/dashboard"
            className="about-nav-link"
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>


          {/* MOBILE AUTH */}

          <div className="about-mobile-auth">

            {isLoggedIn ? (
              <button
                type="button"
                className="about-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="about-login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="about-signup"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>

        </div>


        {/* DESKTOP AUTH */}

        <div className="about-desktop-auth">

          {isLoggedIn ? (
            <button
              type="button"
              className="about-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="about-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="about-signup"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

      </nav>


      {/* =================================================
          HERO SLIDER
      ================================================= */}

      <section className="about-hero">

        <div className="about-hero-overlay"></div>


        <div
          className="about-hero-image"
          style={{
            backgroundImage: `url("${slide.image}")`,
          }}
        ></div>


        <div className="about-hero-content">

          <span className="about-hero-tag">
            {slide.tag}
          </span>

          <h1>
            {slide.title}
            <br />

            <strong>
              {slide.highlight}
            </strong>
          </h1>

          <p>
            {slide.description}
          </p>


          <div className="about-hero-buttons">

            <Link
              to={
                slide.id === 3
                  ? "/dashboard"
                  : "/tests"
              }
              className="about-primary-btn"
            >
              {slide.button}
              <span>→</span>
            </Link>

            <Link
              to="/contact"
              className="about-secondary-btn"
            >
              Talk to Us
            </Link>

          </div>

        </div>


        {/* SLIDER ARROWS */}

        <button
          type="button"
          className="about-slider-arrow about-slider-prev"
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          type="button"
          className="about-slider-arrow about-slider-next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ›
        </button>


        {/* DOTS */}

        <div className="about-slider-dots">

          {slides.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={
                currentSlide === index
                  ? "active"
                  : ""
              }
              onClick={() =>
                goToSlide(index)
              }
              aria-label={`Go to slide ${
                index + 1
              }`}
            ></button>
          ))}

        </div>

      </section>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="about-stats-section">

<div className="about-stats-grid">

  <div className="about-stat">
    <strong>
      {statsLoading ? "..." : `${stats.attempts}+`}
    </strong>
    <span>Practice Attempts</span>
  </div>

  <div className="about-stat">
    <strong>
      {statsLoading ? "..." : `${stats.tests}+`}
    </strong>
    <span>Online Tests</span>
  </div>

  <div className="about-stat">
    <strong>
      {statsLoading ? "..." : `${stats.satisfaction}%`}
    </strong>
    <span>Student Satisfaction</span>
  </div>

  <div className="about-stat">
    <strong>
      {stats.access}
    </strong>
    <span>Learning Access</span>
  </div>

</div>

      </section>


      {/* =================================================
          INTRO
      ================================================= */}

      <section className="about-intro">

        <div className="about-section-label">
          ABOUT TESTHUB
        </div>

        <h2>
          A smarter way to
          <span> prepare, practice & perform.</span>
        </h2>

        <p>
          TestHub is designed to make online
          assessment simple, accessible and
          meaningful. Whether you are preparing
          for an exam, improving your skills or
          simply testing yourself, our platform
          gives you the tools to practice with
          confidence.
        </p>

      </section>


      {/* =================================================
          ZIG ZAG SECTION 01
      ================================================= */}

      <section className="about-zigzag">

        <div className="about-zigzag-image">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
            alt="Online learning"
          />

          <div className="about-floating-card">
            <span>01</span>
            <strong>Learn</strong>
            <small>
              Build your knowledge
            </small>
          </div>
        </div>


        <div className="about-zigzag-content">

          <span className="about-small-label">
            LEARN WITH PURPOSE
          </span>

          <h2>
            Learn at your
            <span> own pace.</span>
          </h2>

          <p>
            Everyone learns differently.
            TestHub gives you the flexibility
            to choose tests according to your
            interests, skills and goals.
          </p>

          <ul>
            <li>
              <span>✓</span>
              Easy-to-understand assessments
            </li>

            <li>
              <span>✓</span>
              Structured learning experience
            </li>

            <li>
              <span>✓</span>
              Practice whenever you want
            </li>
          </ul>

        </div>

      </section>


      {/* =================================================
          ZIG ZAG SECTION 02
      ================================================= */}

      <section className="about-zigzag reverse">

        <div className="about-zigzag-image">

          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=85"
            alt="Student performance"
          />

          <div className="about-floating-card">
            <span>02</span>
            <strong>Practice</strong>
            <small>
              Improve every attempt
            </small>
          </div>

        </div>


        <div className="about-zigzag-content">

          <span className="about-small-label">
            PRACTICE SMARTER
          </span>

          <h2>
            Every attempt
            <span> teaches you something.</span>
          </h2>

          <p>
            Practice is more powerful when
            you understand your performance.
            Take tests, review your results and
            identify areas that need more attention.
          </p>

          <div className="about-mini-stats">

            <div>
              <strong>01</strong>
              <span>Take a test</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Check result</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Improve</span>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          ZIG ZAG SECTION 03
      ================================================= */}

      <section className="about-zigzag">

        <div className="about-zigzag-image">

          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
            alt="Performance dashboard"
          />

          <div className="about-floating-card">
            <span>03</span>
            <strong>Grow</strong>
            <small>
              Track your progress
            </small>
          </div>

        </div>


        <div className="about-zigzag-content">

          <span className="about-small-label">
            GROW WITH DATA
          </span>

          <h2>
            Turn your results
            <span> into progress.</span>
          </h2>

          <p>
            Your results are more than just
            a score. They help you understand
            your strengths and make better
            decisions about what to learn next.
          </p>

          <Link
            to="/dashboard"
            className="about-text-link"
          >
            Explore your dashboard
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="about-how">

        <div className="about-heading">

          <span className="about-section-label">
            HOW IT WORKS
          </span>

          <h2>
            Simple process.
            <span> Real progress.</span>
          </h2>

          <p>
            Start learning and testing your
            knowledge in just a few simple steps.
          </p>

        </div>


        <div className="about-steps">

          <div className="about-step">

            <div className="about-step-number">
              01
            </div>

            <h3>Create your account</h3>

            <p>
              Sign up with your email and
              create your TestHub profile.
            </p>

          </div>


          <div className="about-step-line"></div>


          <div className="about-step">

            <div className="about-step-number">
              02
            </div>

            <h3>Choose a test</h3>

            <p>
              Explore available assessments
              and select one according to
              your goal.
            </p>

          </div>


          <div className="about-step-line"></div>


          <div className="about-step">

            <div className="about-step-number">
              03
            </div>

            <h3>Submit your answers</h3>

            <p>
              Complete the test and submit
              your answers when you are ready.
            </p>

          </div>


          <div className="about-step-line"></div>


          <div className="about-step">

            <div className="about-step-number">
              04
            </div>

            <h3>Understand your result</h3>

            <p>
              Review your score and use
              the result to improve further.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FEATURES
      ================================================= */}

      <section className="about-features">

        <div className="about-heading">

          <span className="about-section-label">
            WHY TESTHUB
          </span>

          <h2>
            Everything you need
            <span> to practice better.</span>
          </h2>

        </div>


        <div className="about-feature-grid">

          <div className="about-feature-card">

            <div className="about-feature-icon">
              ✓
            </div>

            <h3>
              Easy Assessments
            </h3>

            <p>
              Clean and simple test interface
              designed to keep your focus on
              the questions.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              ◷
            </div>

            <h3>
              Timed Tests
            </h3>

            <p>
              Practice under realistic time
              conditions and improve your
              time management.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              ↗
            </div>

            <h3>
              Instant Results
            </h3>

            <p>
              Understand your performance
              immediately after completing
              your assessment.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              ◉
            </div>

            <h3>
              Progress Tracking
            </h3>

            <p>
              Keep your results organized
              and see how your preparation
              is progressing.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              ▣
            </div>

            <h3>
              Certificates
            </h3>

            <p>
              Earn certificates for eligible
              assessments and showcase your
              achievements.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              ♢
            </div>

            <h3>
              Accessible Anywhere
            </h3>

            <p>
              Learn and practice from your
              laptop, tablet or mobile device.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          MISSION
      ================================================= */}

      <section className="about-mission">

        <div className="about-mission-content">

          <span>
            OUR MISSION
          </span>

          <h2>
            Making learning
            <br />
            <strong>more accessible.</strong>
          </h2>

          <p>
            We believe that meaningful practice
            should be available to everyone.
            TestHub is built around a simple idea:
            give learners a reliable place to test
            themselves, understand their results
            and keep moving forward.
          </p>

          <Link
            to="/tests"
            className="about-mission-btn"
          >
            Start Practicing
            <span>→</span>
          </Link>

        </div>


        <div className="about-mission-visual">

          <div className="mission-circle circle-one"></div>
          <div className="mission-circle circle-two"></div>
          <div className="mission-circle circle-three"></div>

          <div className="mission-card">

            <div className="mission-card-top">
              <span>TESTHUB</span>
              <b>2026</b>
            </div>

            <strong>
              Learn.
              <br />
              Practice.
              <br />
              Grow.
            </strong>

            <small>
              Your journey starts with
              one attempt.
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          FAQ
      ================================================= */}

      <section className="about-faq-section">

        <div className="about-heading">

          <span className="about-section-label">
            FAQ
          </span>

          <h2>
            Questions?
            <span> We've got answers.</span>
          </h2>

        </div>


        <div className="about-faq-container">

          {[
            {
              question:
                "What is TestHub?",
              answer:
                "TestHub is an online assessment platform where users can practice tests, evaluate their knowledge and track their performance."
            },

            {
              question:
                "Who can use TestHub?",
              answer:
                "Anyone who wants to practice, assess their knowledge or improve their preparation can use TestHub."
            },

            {
              question:
                "Can I see my test results?",
              answer:
                "Yes. After completing a test, your result can be reviewed through the platform and your dashboard."
            },

            {
              question:
                "Can I earn a certificate?",
              answer:
                "Eligible tests can generate certificates according to the platform's certificate requirements and approval process."
            },

            {
              question:
                "Can I use TestHub on mobile?",
              answer:
                "Yes. The interface is designed to work across desktop, tablet and mobile screen sizes."
            },

          ].map((faq, index) => (

            <div
              className={`about-faq-item ${
                openFaq === index
                  ? "open"
                  : ""
              }`}
              key={faq.question}
            >

              <button
                type="button"
                className="about-faq-question"
                onClick={() =>
                  setOpenFaq(
                    openFaq === index
                      ? -1
                      : index
                  )
                }
              >

                <span>
                  {faq.question}
                </span>

                <strong>
                  {openFaq === index
                    ? "−"
                    : "+"}
                </strong>

              </button>


              {openFaq === index && (
                <div className="about-faq-answer">
                  <p>
                    {faq.answer}
                  </p>
                </div>
              )}

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section className="about-final-cta">

        <div>

          <span>
            READY TO GET STARTED?
          </span>

          <h2>
            Your next improvement
            <br />
            starts with one test.
          </h2>

          <p>
            Practice today and take one step
            closer to your goal.
          </p>

        </div>


        <div className="about-final-actions">

          <Link
            to="/tests"
            className="about-final-primary"
          >
            Explore Tests
            <span>→</span>
          </Link>

          <Link
            to="/contact"
            className="about-final-secondary"
          >
            Contact Us
          </Link>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="about-footer">

        <div className="about-footer-brand">

          <div className="about-footer-logo">
            <span>🎓</span>
            <strong>TestHub</strong>
          </div>

          <p>
            Learn • Practice • Grow
          </p>

        </div>


        <div className="about-footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/tests">
            Tests
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/contact">
            Contact
          </Link>

        </div>


        <div className="about-footer-copy">
          © {new Date().getFullYear()} TestHub.
          All rights reserved.
        </div>

      </footer>

    </div>
  );
}


export default About;
