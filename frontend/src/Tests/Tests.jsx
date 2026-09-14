import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Tests.css";

const API = "http://localhost:5000";

/* =========================================================
   NAVBAR
========================================================= */

function TestsNavbar() {
  const isLoggedIn = !!localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);

    window.location.href = "/login";
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="tests-navbar">

      {/* LOGO */}
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


      {/* HAMBURGER BUTTON */}
      <button
        type="button"
        className={`tests-mobile-menu-btn ${
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


      {/* NAVIGATION */}
      <div
        className={`tests-nav-links ${
          menuOpen ? "mobile-open" : ""
        }`}
      >

        <Link
          to="/"
          className="tests-nav-link"
          onClick={closeMenu}
        >
          Home
        </Link>

        <Link
          to="/tests"
          className="tests-nav-link active"
          onClick={closeMenu}
        >
          Tests
        </Link>

        <Link
          to="/about"
          className="tests-nav-link"
          onClick={closeMenu}
        >
          About
        </Link>

        <Link
          to="/contact"
          className="tests-nav-link"
          onClick={closeMenu}
        >
          Contact
        </Link>

        <Link
          to="/dashboard"
          className="tests-nav-link"
          onClick={closeMenu}
        >
          Dashboard
        </Link>


        {/* MOBILE BUTTONS */}
        <div className="tests-mobile-nav-buttons">

          {isLoggedIn ? (
            <button
              type="button"
              className="tests-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="tests-login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="tests-signup-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

      </div>


      {/* DESKTOP BUTTONS */}
      <div className="tests-nav-buttons">

        {isLoggedIn ? (
          <button
            type="button"
            className="tests-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="tests-login-btn"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="tests-signup-btn"
            >
              Sign Up
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

/* =========================================================
   MAIN TESTS COMPONENT
========================================================= */

function Tests() {

  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [difficulty, setDifficulty] = useState("All");


  /* =========================================================
     FETCH TESTS
  ========================================================= */

  useEffect(() => {
    fetchTests();
  }, []);


  const fetchTests = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/tests`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load tests"
        );
      }

      const testList = Array.isArray(data)
        ? data
        : data.tests ||
          data.data ||
          [];

      setTests(testList);

    } catch (err) {

      console.error(
        "Tests loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load tests"
      );

    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
     HELPERS
  ========================================================= */

  const getTestId = (test) => {
    return (
      test.id ||
      test.test_id ||
      test._id
    );
  };


  const getTitle = (test) => {
    return (
      test.title ||
      test.name ||
      test.test_name ||
      "Untitled Test"
    );
  };


  const getCategory = (test) => {
    return (
      test.category ||
      test.category_name ||
      test.subject ||
      "General"
    );
  };


  const getDifficulty = (test) => {
    return (
      test.difficulty ||
      test.level ||
      "Medium"
    );
  };


  const getQuestions = (test) => {
    return (
      test.total_questions ||
      test.question_count ||
      test.questions_count ||
      test.questions ||
      0
    );
  };


  const getDuration = (test) => {
    return (
      test.duration ||
      test.time_limit ||
      test.time ||
      30
    );
  };


  const getDescription = (test) => {
    return (
      test.description ||
      "Test your knowledge and improve your performance."
    );
  };


  /* =========================================================
     ICON
  ========================================================= */

  const getIcon = (categoryName) => {

    const value = String(
      categoryName || ""
    ).toLowerCase();


    if (
      value.includes("aptitude") ||
      value.includes("math")
    ) {
      return "🧮";
    }


    if (
      value.includes("coding") ||
      value.includes("program") ||
      value.includes("computer")
    ) {
      return "💻";
    }


    if (
      value.includes("english") ||
      value.includes("language")
    ) {
      return "📖";
    }


    if (
      value.includes("science") ||
      value.includes("physics") ||
      value.includes("chemistry")
    ) {
      return "🔬";
    }


    if (
      value.includes("general") ||
      value.includes("gk")
    ) {
      return "🧠";
    }


    if (
      value.includes("reasoning")
    ) {
      return "🧩";
    }


    return "📝";
  };


  /* =========================================================
     DIFFICULTY CLASS
  ========================================================= */

  const difficultyClass = (value) => {

    const difficultyValue =
      String(value || "")
        .toLowerCase();


    if (
      difficultyValue === "easy"
    ) {
      return "easy";
    }


    if (
      difficultyValue === "hard" ||
      difficultyValue === "difficult"
    ) {
      return "hard";
    }


    return "medium";
  };


  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {

    const values = tests
      .map((test) =>
        getCategory(test)
      )
      .filter(Boolean);


    return [
      "All",
      ...new Set(values)
    ];

  }, [tests]);


  /* =========================================================
     FILTER TESTS
  ========================================================= */

  const filteredTests = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();


    return tests.filter((test) => {

      const title =
        String(
          getTitle(test)
        ).toLowerCase();


      const description =
        String(
          getDescription(test)
        ).toLowerCase();


      const testCategory =
        String(
          getCategory(test)
        );


      const testDifficulty =
        String(
          getDifficulty(test)
        );


      const matchesSearch =
        title.includes(searchValue) ||
        description.includes(searchValue) ||
        testCategory
          .toLowerCase()
          .includes(searchValue);


      const matchesCategory =
        category === "All" ||
        testCategory === category;


      const matchesDifficulty =
        difficulty === "All" ||
        testDifficulty.toLowerCase() ===
          difficulty.toLowerCase();


      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty
      );

    });

  }, [
    tests,
    search,
    category,
    difficulty
  ]);


  /* =========================================================
     TOTAL STATS
  ========================================================= */

  const totalQuestions = tests.reduce(
    (total, test) => {

      return (
        total +
        Number(
          getQuestions(test) || 0
        )
      );

    },
    0
  );


  const totalMinutes = tests.reduce(
    (total, test) => {

      return (
        total +
        Number(
          getDuration(test) || 0
        )
      );

    },
    0
  );


  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {

    setSearch("");
    setCategory("All");
    setDifficulty("All");

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="tests-page">

        <TestsNavbar />

        <div className="tests-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading Tests...
          </h3>

          <p>
            Please wait while we fetch
            available tests.
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (

    <div className="tests-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <TestsNavbar />


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="tests-hero">

        <div className="tests-hero-content">

          <div className="hero-badge">
            🎯 PRACTICE • LEARN • IMPROVE
          </div>


          <h1>
            Test Your
            <span>
              Knowledge
            </span>
          </h1>


          <p>
            Challenge yourself with carefully
            designed online tests and track
            your learning progress.
          </p>


          {/* HERO STATS */}

          <div className="hero-stats">

            <div className="hero-stat">

              <strong>
                {tests.length}
              </strong>

              <span>
                Available Tests
              </span>

            </div>


            <div className="hero-stat">

              <strong>
                {totalQuestions}
              </strong>

              <span>
                Total Questions
              </span>

            </div>


            <div className="hero-stat">

              <strong>
                {totalMinutes}
              </strong>

              <span>
                Practice Minutes
              </span>

            </div>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="tests-hero-visual">

          <div className="hero-circle">
            📝
          </div>


          <div className="floating-card floating-card-one">

            <span>🏆</span>

            <div>

              <strong>
                Improve
              </strong>

              <small>
                Your Score
              </small>

            </div>

          </div>


          <div className="floating-card floating-card-two">

            <span>⏱️</span>

            <div>

              <strong>
                Practice
              </strong>

              <small>
                Anytime
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="tests-main">


        {/* ===================================================
            SECTION HEADER
        =================================================== */}

        <div className="tests-section-header">

          <div>

            <span className="section-label">
              EXPLORE TESTS
            </span>

            <h2>
              Choose Your Test
            </h2>

            <p>
              Find a test that matches
              your preparation goals.
            </p>

          </div>


          {/* RESULT COUNT */}

          <div className="tests-count">

            <strong>
              {filteredTests.length}
            </strong>

            <span>
              {filteredTests.length === 1
                ? "Test"
                : "Tests"}
            </span>

          </div>

        </div>


        {/* ===================================================
            SEARCH + FILTERS
        =================================================== */}

        <div className="tests-toolbar">


          {/* SEARCH */}

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (

              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>

            )}

          </div>


          {/* FILTERS */}

          <div className="filter-group">

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >

              {categories.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Categories"
                      : item}
                  </option>

                )
              )}

            </select>


            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Levels
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

            </select>

          </div>

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="tests-error">

            <div className="error-icon">
              ⚠️
            </div>

            <div>

              <h3>
                Unable to load tests
              </h3>

              <p>
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={fetchTests}
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            EMPTY RESULT
        =================================================== */}

        {!error &&
          filteredTests.length === 0 && (

            <div className="no-tests">

              <div className="no-tests-icon">
                🔎
              </div>

              <h3>
                No tests found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          )}


        {/* ===================================================
            TEST GRID
        =================================================== */}

        {!error &&
          filteredTests.length > 0 && (

            <div className="tests-grid">

              {filteredTests.map(
                (test) => {

                  const id =
                    getTestId(test);

                  const title =
                    getTitle(test);

                  const testCategory =
                    getCategory(test);

                  const testDifficulty =
                    getDifficulty(test);

                  const questions =
                    getQuestions(test);

                  const duration =
                    getDuration(test);

                  const description =
                    getDescription(test);


                  return (

                    <article
                      className="test-card"
                      key={id}
                    >

                      {/* CARD HEADER */}

                      <div className="test-card-top">

                        <div className="test-icon">
                          {getIcon(
                            testCategory
                          )}
                        </div>

                        <span
                          className={`difficulty-badge ${difficultyClass(
                            testDifficulty
                          )}`}
                        >
                          {testDifficulty}
                        </span>

                      </div>


                      {/* CARD CONTENT */}

                      <div className="test-card-content">

                        <span className="test-category">
                          {testCategory}
                        </span>

                        <h3>
                          {title}
                        </h3>

                        <p>
                          {description}
                        </p>

                      </div>


                      {/* TEST INFO */}

                      <div className="test-info">

                        <div className="test-info-item">

                          <span>
                            ❓
                          </span>

                          <div>

                            <strong>
                              {questions}
                            </strong>

                            <small>
                              Questions
                            </small>

                          </div>

                        </div>


                        <div className="test-info-item">

                          <span>
                            ⏱️
                          </span>

                          <div>

                            <strong>
                              {duration}
                            </strong>

                            <small>
                              Minutes
                            </small>

                          </div>

                        </div>

                      </div>


                      {/* START TEST */}

                      <Link
                        to={`/test-instructions/${id}`}
                        className="start-test-btn"
                      >

                        <span>
                          Start Test
                        </span>

                        <span className="arrow">
                          →
                        </span>

                      </Link>

                    </article>

                  );

                }
              )}

            </div>

          )}


        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        {!error &&
          filteredTests.length > 0 && (

            <section className="tests-cta">

              <div className="cta-icon">
                🚀
              </div>


              <div className="cta-content">

                <span className="cta-label">
                  KEEP LEARNING
                </span>

                <h2>
                  Ready to challenge yourself?
                </h2>

                <p>
                  Take a test, analyze your
                  performance and keep improving
                  every day.
                </p>

              </div>


              <button
                type="button"
                className="cta-btn"
                onClick={() => {

                  document
                    .querySelector(
                      ".tests-toolbar"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center"
                    });

                }}
              >
                Explore Tests
                <span>↑</span>
              </button>

            </section>

          )}

      </main>

    </div>
  );
}


export default Tests;