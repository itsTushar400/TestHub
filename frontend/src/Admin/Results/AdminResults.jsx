import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminResults.css";
import "../AdminDashboard.css";
const API_URL = import.meta.env.VITE_API_URL || "https://testhub-backend-y450.onrender.com";

function AdminResults() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [testFilter, setTestFilter] = useState("all");

  const [selectedResult, setSelectedResult] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!token || !user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchResults();
  }, []);

  /* ================= FETCH RESULTS ================= */

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/results`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch results"
        );
      }

      setResults(data.results || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Failed to fetch results"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UNIQUE TESTS ================= */

  const tests = useMemo(() => {
    const uniqueTests = [];

    results.forEach((item) => {
      if (
        item.test_id &&
        !uniqueTests.some(
          (test) => test.id === item.test_id
        )
      ) {
        uniqueTests.push({
          id: item.test_id,
          title: item.test_title,
        });
      }
    });

    return uniqueTests;
  }, [results]);

  /* ================= FILTER RESULTS ================= */

  const filteredResults = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return results.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.user_name
          ?.toLowerCase()
          .includes(searchText) ||
        item.user_email
          ?.toLowerCase()
          .includes(searchText) ||
        item.test_title
          ?.toLowerCase()
          .includes(searchText);

      const matchesTest =
        testFilter === "all" ||
        String(item.test_id) ===
          String(testFilter);

      return matchesSearch && matchesTest;
    });
  }, [results, search, testFilter]);

  /* ================= STATISTICS ================= */

  const totalAttempts = results.length;

  const averageScore =
    results.length > 0
      ? (
          results.reduce(
            (sum, item) =>
              sum + Number(item.percentage || 0),
            0
          ) / results.length
        ).toFixed(1)
      : "0.0";

  const highestScore =
    results.length > 0
      ? Math.max(
          ...results.map((item) =>
            Number(item.percentage || 0)
          )
        )
      : 0;

  const passedResults = results.filter(
    (item) =>
      Number(item.percentage || 0) >= 40
  ).length;

  const passRate =
    results.length > 0
      ? (
          (passedResults / results.length) *
          100
        ).toFixed(1)
      : "0.0";

  /* ================= DATE FORMAT ================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= TIME FORMAT ================= */

const formatTime = (seconds) => {
  const totalSeconds = Number(seconds) || 0;

  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (minutes === 0) {
    return `${secs} sec`;
  }

  if (secs === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${secs} sec`;
};

  /* ================= SCORE CLASS ================= */

  const getScoreClass = (percentage) => {
    const score = Number(percentage || 0);

    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "average";

    return "poor";
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ================= VIEW RESULT ================= */

  const handleViewResult = async (resultId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/results/${resultId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch result"
        );
      }

      setSelectedResult(data);
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Failed to open result"
      );

      setMessageType("error");
    }
  };

  /* ================= CLOSE RESULT ================= */

  const closeResult = () => {
    setSelectedResult(null);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="loading-page">
        <div className="results-loader">
          <div className="loader-circle"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="admin-page">

      {/* ================= SIDEBAR ================= */}

<aside className="admin-sidebar">

  <div className="admin-logo">
    Online Test
    <span>ADMIN PANEL</span>
  </div>

  <nav className="admin-menu">

    <Link
      to="/admin"
      className="admin-menu-item"
    >
      ðŸ“Š Dashboard
    </Link>

    <Link
      to="/admin/users"
      className="admin-menu-item"
    >
      ðŸ‘¥ Users
    </Link>

    <Link
      to="/admin/tests"
      className="admin-menu-item"
    >
      ðŸ“ Tests
    </Link>

    <Link
      to="/admin/questions"
      className="admin-menu-item"
    >
      â“ Questions
    </Link>

    <Link
      to="/admin/results"
      className="admin-menu-item active"
    >
      ðŸ“ˆ Results
    </Link>

    <Link
  to="/admin/certificates"
  className="admin-menu-item"
>
  ðŸ“œ Certificates
</Link>


  </nav>

  <div className="admin-sidebar-bottom">

    <Link
      to="/"
      className="view-website"
    >
      ðŸŒ View Website
    </Link>

    <button
      type="button"
      className="admin-logout"
      onClick={handleLogout}
    >
      ðŸšª Logout
    </button>

  </div>

</aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= HEADER ================= */}

        <header className="admin-header">

          <div>
            <h1>Test Results</h1>

            <p>
              Monitor student performance and test attempts
            </p>
          </div>

          <div className="results-header-actions">

            <button
              type="button"
              className="refresh-btn"
              onClick={fetchResults}
            >
              ðŸ”„ Refresh
            </button>

          </div>

        </header>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div
            className={
              messageType === "success"
                ? "admin-success-message"
                : "admin-error-message"
            }
          >
            <span>
              {messageType === "success"
                ? "âœ“"
                : "âš "}
            </span>

            <p>{message}</p>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setMessageType("");
              }}
            >
              Ã—
            </button>
          </div>
        )}

        {/* ================= STAT CARDS ================= */}

        <section className="results-stats-grid">

          <div className="result-stat-card">
            <div className="result-stat-icon">
              ðŸ“Š
            </div>

            <div>
              <span>Total Attempts</span>
              <strong>{totalAttempts}</strong>
            </div>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              ðŸŽ¯
            </div>

            <div>
              <span>Average Score</span>
              <strong>{averageScore}%</strong>
            </div>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              ðŸ†
            </div>

            <div>
              <span>Highest Score</span>
              <strong>{highestScore}%</strong>
            </div>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              âœ…
            </div>

            <div>
              <span>Pass Rate</span>
              <strong>{passRate}%</strong>
            </div>
          </div>

        </section>

        {/* ================= FILTERS ================= */}

        <section className="results-filter-card">

          <div className="results-search">

            <span>ðŸ”</span>

            <input
              type="text"
              placeholder="Search student, email or test..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="results-filter">

            <label>Test</label>

            <select
              value={testFilter}
              onChange={(e) =>
                setTestFilter(e.target.value)
              }
            >
              <option value="all">
                All Tests
              </option>

              {tests.map((testItem) => (
                <option
                  key={testItem.id}
                  value={testItem.id}
                >
                  {testItem.title}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* ================= RESULTS TABLE ================= */}

        <section className="results-table-card">

          <div className="results-table-header">

            <div>
              <h2>All Results</h2>

              <p>
                {filteredResults.length} result
                {filteredResults.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

          </div>

          {filteredResults.length === 0 ? (

            <div className="empty-results">

              <div className="empty-results-icon">
                ðŸ“Š
              </div>

              <h3>
                No results found
              </h3>

              <p>
                No test attempts match your current filters.
              </p>

            </div>

          ) : (

            <div className="results-table-wrapper">

              <table className="results-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredResults.map(
                    (item, index) => (

                      <tr key={item.id}>

                        {/* STUDENT */}

                        <td>

                          <div className="student-cell">

                            <div className="student-avatar">
                              {(
                                item.user_name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {item.user_name ||
                                  "Unknown User"}
                              </strong>

                              <span>
                                {item.user_email ||
                                  "-"}
                              </span>
                            </div>

                          </div>

                        </td>

                        {/* TEST */}

                        <td>

                          <div className="test-cell">

                            <strong>
                              {item.test_title ||
                                "Unknown Test"}
                            </strong>

                            <span>
                              Attempt #{item.id}
                            </span>

                          </div>

                        </td>

                        {/* SCORE */}

                        <td>

                          <span className="score-text">
                            {item.score}/
                            {item.total_questions}
                          </span>

                        </td>

                        {/* PERCENTAGE */}

                        <td>

                          <span
                            className={`percentage-badge ${getScoreClass(
                              item.percentage
                            )}`}
                          >
                            {Number(
                              item.percentage || 0
                            ).toFixed(1)}
                            %
                          </span>

                        </td>

                        {/* TIME */}

                        <td>

                          <span className="time-cell">
                         â±ï¸{formatTime(item.time_taken)}
                          </span>

                        </td>

                        {/* DATE */}

                        <td>

                          <span className="date-cell">
                            {formatDate(
                              item.submitted_at
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            type="button"
                            className="view-result-btn"
                            onClick={() =>
                              handleViewResult(
                                item.id
                              )
                            }
                          >
                            ðŸ‘ View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* ================= RESULT MODAL ================= */}

      {selectedResult && (
        <div
          className="result-modal-overlay"
          onClick={closeResult}
        >

          <div
            className="result-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="result-modal-header">

              <div>
                <span className="modal-small-title">
                  Test Result
                </span>

                <h2>
                  {selectedResult.result
                    ?.test_title ||
                    "Test Result"}
                </h2>
              </div>

              <button
                type="button"
                className="close-result-modal"
                onClick={closeResult}
              >
                Ã—
              </button>

            </div>

            {/* STUDENT */}

            <div className="modal-student">

              <div className="modal-student-avatar">
                {(
                  selectedResult.result
                    ?.user_name || "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                    {formatTime(selectedResult.result?.time_taken)}
                    
                </strong>

                <span>
                  {selectedResult.result
                    ?.user_id
                    ? `Student ID: ${selectedResult.result.user_id}`
                    : ""}
                </span>
              </div>

            </div>

            {/* SCORE OVERVIEW */}

            <div className="modal-score-grid">

              <div>
                <span>Score</span>

                <strong>
                  {
                    selectedResult.result
                      ?.score
                  }
                  /
                  {
                    selectedResult.result
                      ?.total_questions
                  }
                </strong>
              </div>

              <div>
                <span>Percentage</span>

                <strong>
                  {Number(
                    selectedResult.result
                      ?.percentage || 0
                  ).toFixed(1)}
                  %
                </strong>
              </div>

              <div>
                <span>Time Taken</span>

                <strong>
                  {
                    selectedResult.result
                      ?.time_taken || 0
                  }{" "}
                  min
                </strong>
              </div>

            </div>

            {/* ANSWERS */}

            <div className="modal-answers">

              <h3>
                Question Review
              </h3>

              {selectedResult.answers?.map(
                (answer, index) => {

                  const isCorrect =
                    answer.selected_answer ===
                    answer.correct_answer;

                  return (
                    <div
                      className={`modal-answer-item ${
                        isCorrect
                          ? "answer-correct"
                          : "answer-wrong"
                      }`}
                      key={answer.id}
                    >

                      <div className="modal-answer-top">

                        <span>
                          Question {index + 1}
                        </span>

                        <strong>
                          {isCorrect
                            ? "âœ“ Correct"
                            : "âœ• Wrong"}
                        </strong>

                      </div>

                      <p>
                        {answer.question}
                      </p>

                      <div className="answer-details">

                        <span>
                          Your Answer:{" "}
                          <b>
                            {answer.selected_answer ||
                              "Not Answered"}
                          </b>
                        </span>

                        <span>
                          Correct Answer:{" "}
                          <b>
                            {answer.correct_answer}
                          </b>
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminResults;

