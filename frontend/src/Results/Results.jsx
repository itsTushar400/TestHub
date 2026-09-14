import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Results.css";

const API_URL = "http://localhost:5000";

function Results() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [user, setUser] = useState({
    name: "Student",
    profile_photo: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ================= PROFILE PHOTO =================

  const getProfilePhoto = () => {
    if (!user.profile_photo) return "";

    if (
      user.profile_photo.startsWith("http://") ||
      user.profile_photo.startsWith("https://")
    ) {
      return user.profile_photo;
    }

    return `${API_URL}${user.profile_photo}`;
  };

  const getInitial = () => {
    return user.name
      ? user.name.charAt(0).toUpperCase()
      : "S";
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile(token);
    loadResults(token);
  }, [navigate]);

  // ================= PROFILE =================

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

      if (!response.ok) return;

      const data = await response.json();

      if (data.user) {
        setUser({
          name: data.user.name || "Student",
          profile_photo:
            data.user.profile_photo || null,
        });

        const oldUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...oldUser,
            ...data.user,
          })
        );
      }
    } catch (err) {
      console.log("Profile error:", err);
    }
  };

  // ================= RESULTS =================

  const loadResults = async (token) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/dashboard/results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load results"
        );
      }

      setResults(data.results || []);
    } catch (err) {
      console.error("Results error:", err);

      setError(
        err.message ||
          "Unable to load your results."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ================= FORMAT TIME =================

  const formatTime = (seconds) => {
    const totalSeconds = Number(seconds) || 0;

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const secs = totalSeconds % 60;

    if (minutes === 0) {
      return `${secs} sec`;
    }

    if (secs === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${secs} sec`;
  };

  // ================= RESULT STATUS =================

  const getStatus = (percentage) => {
    return Number(percentage) >= 40
      ? "Passed"
      : "Failed";
  };

  // ================= SCORE CLASS =================

  const getScoreClass = (percentage) => {
    const value = Number(percentage) || 0;

    if (value >= 80) return "excellent";
    if (value >= 60) return "good";
    if (value >= 40) return "average";

    return "poor";
  };

  // ================= FILTER RESULTS =================

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const title =
        result.test_title ||
        "Untitled Test";

      const matchesSearch =
        title
          .toLowerCase()
          .includes(
            search.toLowerCase().trim()
          );

      const status = getStatus(
        result.percentage
      );

      const matchesFilter =
        filter === "all" ||
        (filter === "passed" &&
          status === "Passed") ||
        (filter === "failed" &&
          status === "Failed");

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [results, search, filter]);

  // ================= SUMMARY =================

  const summary = useMemo(() => {
    const total = results.length;

    const passed = results.filter(
      (item) =>
        Number(item.percentage) >= 40
    ).length;

    const failed = total - passed;

    const average =
      total > 0
        ? results.reduce(
            (sum, item) =>
              sum +
              Number(item.percentage || 0),
            0
          ) / total
        : 0;

    const best =
      total > 0
        ? Math.max(
            ...results.map((item) =>
              Number(item.percentage || 0)
            )
          )
        : 0;

    return {
      total,
      passed,
      failed,
      average,
      best,
    };
  }, [results]);

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="results-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="results-navbar">

        {/* BRAND */}

        <Link
          to="/"
          className="results-brand"
        >
          <div className="results-brand-icon">
            🎓
          </div>

          <div>
            <strong>
              TestHub
            </strong>

            <span>
              LEARN • PRACTICE • GROW
            </span>
          </div>
        </Link>


        {/* NAV LINKS */}

        <nav className="results-nav">

          <Link
            to="/"
            className="results-nav-link"
          >
            Home
          </Link>

          <Link
            to="/tests"
            className="results-nav-link"
          >
            Tests
          </Link>

          <Link
            to="/results"
            className="results-nav-link active"
          >
            Results
          </Link>

          <Link
            to="/certificates"
            className="results-nav-link"
          >
            Certificates
          </Link>

          <Link
            to="/leaderboard"
            className="results-nav-link"
          >
            Leaderboard
          </Link>

          <Link
            to="/dashboard"
            className="results-nav-link"
          >
            Dashboard
          </Link>

        </nav>


        {/* RIGHT */}

        <div className="results-navbar-right">

          <div className="results-search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search results..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <button
            className="results-notification"
            type="button"
          >
            🔔
          </button>


          <Link
            to="/account"
            className="results-user"
          >

            <div className="results-mini-avatar">

              {getProfilePhoto() ? (
                <img
                  src={getProfilePhoto()}
                  alt="Profile"
                />
              ) : (
                getInitial()
              )}

            </div>

            <span>
              {user.name}
            </span>

            <b>
              ▾
            </b>

          </Link>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="results-container">

        {/* PAGE HEADER */}

        <section className="results-page-header">

          <div>

            <span className="results-eyebrow">
              PERFORMANCE
            </span>

            <h1>
              My Results
            </h1>

            <p>
              Track your test performance,
              scores and learning progress.
            </p>

          </div>

          <Link
            to="/tests"
            className="take-test-btn"
          >
            📝 Take a New Test
          </Link>

        </section>


        {/* ERROR */}

        {error && (
          <div className="results-alert">
            <span>!</span>
            {error}
          </div>
        )}


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="results-summary">

          <div className="summary-card">

            <div className="summary-icon blue">
              📝
            </div>

            <div>
              <span>
                Tests Attempted
              </span>

              <strong>
                {loading
                  ? "..."
                  : summary.total}
              </strong>

              <small>
                Total attempts
              </small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>
              <span>
                Passed
              </span>

              <strong>
                {loading
                  ? "..."
                  : summary.passed}
              </strong>

              <small>
                Successful attempts
              </small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon red">
              ✕
            </div>

            <div>
              <span>
                Failed
              </span>

              <strong>
                {loading
                  ? "..."
                  : summary.failed}
              </strong>

              <small>
                Needs improvement
              </small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon purple">
              📊
            </div>

            <div>
              <span>
                Average Score
              </span>

              <strong>
                {loading
                  ? "..."
                  : `${summary.average.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                Overall performance
              </small>
            </div>

          </div>


          <div className="summary-card best-card">

            <div className="summary-icon orange">
              🏆
            </div>

            <div>
              <span>
                Best Score
              </span>

              <strong>
                {loading
                  ? "..."
                  : `${summary.best.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                Highest achievement
              </small>
            </div>

          </div>

        </section>


        {/* =================================================
            RESULTS PANEL
        ================================================= */}

        <section className="results-panel">

          <div className="results-panel-header">

            <div>

              <span>
                TEST HISTORY
              </span>

              <h2>
                Your Test Results
              </h2>

            </div>


            <div className="results-filters">

              <button
                className={
                  filter === "all"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </button>

              <button
                className={
                  filter === "passed"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFilter("passed")
                }
              >
                Passed
              </button>

              <button
                className={
                  filter === "failed"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFilter("failed")
                }
              >
                Failed
              </button>

            </div>

          </div>


          {/* LOADING */}

          {loading ? (
            <div className="results-loading">

              <div className="loading-spinner"></div>

              <strong>
                Loading your results...
              </strong>

              <span>
                Please wait a moment.
              </span>

            </div>
          ) : filteredResults.length === 0 ? (

            /* EMPTY */

            <div className="results-empty">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                {results.length === 0
                  ? "No Test Results Yet"
                  : "No Matching Results"}
              </h3>

              <p>
                {results.length === 0
                  ? "Complete your first test and your result will appear here."
                  : "Try changing your search or filter."}
              </p>

              {results.length === 0 && (
                <Link
                  to="/tests"
                  className="empty-test-btn"
                >
                  Explore Tests →
                </Link>
              )}

            </div>
          ) : (

            /* TABLE */

            <div className="results-table-wrapper">

              <table className="results-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Test
                    </th>

                    <th>
                      Score
                    </th>

                    <th>
                      Percentage
                    </th>

                    <th>
                      Time Taken
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Result
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredResults.map(
                    (result, index) => {

                      const percentage =
                        Number(
                          result.percentage || 0
                        );

                      const status =
                        getStatus(
                          percentage
                        );

                      return (
                        <tr
                          key={
                            result.id ||
                            index
                          }
                        >

                          <td>
                            <span className="result-number">
                              {index + 1}
                            </span>
                          </td>


                          <td>

                            <div className="test-title-cell">

                              <div className="test-result-icon">
                                📝
                              </div>

                              <div>

                                <strong>
                                  {result.test_title ||
                                    "Untitled Test"}
                                </strong>

                                <span>
                                  Test Attempt #
                                  {result.id ||
                                    index + 1}
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <strong className="score-text">
                              {result.score || 0}
                              /
                              {result.total_questions ||
                                0}
                            </strong>

                          </td>


                          <td>

                            <div className="percentage-cell">

                              <div className="percentage-top">

                                <strong
                                  className={
                                    getScoreClass(
                                      percentage
                                    )
                                  }
                                >
                                  {percentage.toFixed(
                                    1
                                  )}
                                  %
                                </strong>

                              </div>

                              <div className="progress-track">

                                <div
                                  className={`progress-fill ${getScoreClass(
                                    percentage
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      percentage,
                                      100
                                    )}%`,
                                  }}
                                ></div>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span className="time-cell">
                              ⏱️{" "}
                              {formatTime(
                                result.time_taken
                              )}
                            </span>

                          </td>


                          <td>

                            <span className="date-cell">
                              {formatDate(
                                result.submitted_at
                              )}
                            </span>

                          </td>


                          <td>

                            <span
                              className={
                                status ===
                                "Passed"
                                  ? "status-badge passed"
                                  : "status-badge failed"
                              }
                            >
                              {status ===
                              "Passed"
                                ? "✓ Passed"
                                : "✕ Failed"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* =================================================
            PERFORMANCE MESSAGE
        ================================================= */}

        {!loading &&
          results.length > 0 && (
            <section className="performance-note">

              <div className="performance-note-icon">
                💡
              </div>

              <div>

                <strong>
                  Keep improving!
                </strong>

                <p>
                  Your current average is{" "}
                  <b>
                    {summary.average.toFixed(
                      1
                    )}
                    %
                  </b>
                  . Keep practicing regularly
                  to improve your performance.
                </p>

              </div>

              <Link to="/tests">
                Practice More →
              </Link>

            </section>
          )}

      </main>


      {/* =================================================
          FLOATING AI
      ================================================= */}

      <Link
        to="/ai-doubt"
        className="results-ai-button"
        title="AI Doubt Solver"
      >
        🤖
      </Link>

    </div>
  );
}

export default Results;