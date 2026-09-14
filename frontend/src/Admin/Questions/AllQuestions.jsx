import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AllQuestions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedTest, setSelectedTest] = useState("all");

  /* ================= AUTH ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!token || !user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    loadData();
  }, []);

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    try {
      setLoading(true);

      const [questionsResponse, testsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/questions`),
          fetch(`${API_URL}/api/admin/tests`),
        ]);

      const questionsData =
        await questionsResponse.json();

      const testsData =
        await testsResponse.json();

      if (questionsResponse.ok) {
        setQuestions(
          questionsData.questions || []
        );
      }

      if (testsResponse.ok) {
        setTests(
          testsData.tests || []
        );
      }
    } catch (error) {
      console.error(
        "Questions loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/questions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete question"
        );
      }

      loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to delete question"
      );
    }
  };

  /* ================= FILTER ================= */

  const filteredQuestions =
    questions.filter((item) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.question
          ?.toLowerCase()
          .includes(searchText) ||
        item.test_title
          ?.toLowerCase()
          .includes(searchText);

      const matchesTest =
        selectedTest === "all" ||
        String(item.test_id) ===
          String(selectedTest);

      return (
        matchesSearch &&
        matchesTest
      );
    });

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

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
            📊 Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="admin-menu-item"
          >
            👥 Users
          </Link>

          <Link
            to="/admin/tests"
            className="admin-menu-item"
          >
            📝 Tests
          </Link>

          <Link
            to="/admin/questions"
            className="admin-menu-item active"
          >
            ❓ Questions
          </Link>

          <Link
            to="/admin/results"
            className="admin-menu-item"
          >
            📈 Results
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/"
            className="view-website"
          >
            🌐 View Website
          </Link>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= HEADER ================= */}

        <header className="admin-header">

          <div>

            <h1>
              Questions
            </h1>

            <p>
              Manage all questions across your tests
            </p>

          </div>

          <div className="admin-topbar-actions">

            <button
              className="refresh-btn"
              onClick={loadData}
            >
              🔄 Refresh
            </button>

          </div>

        </header>

        {/* ================= FILTER BAR ================= */}

        <section className="questions-filter-card">

          <div className="question-search-box">

            <span>🔎</span>

            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            value={selectedTest}
            onChange={(e) =>
              setSelectedTest(e.target.value)
            }
            className="question-test-filter"
          >

            <option value="all">
              All Tests
            </option>

            {tests.map((test) => (
              <option
                key={test.id}
                value={test.id}
              >
                {test.title}
              </option>
            ))}

          </select>

        </section>

        {/* ================= STATS ================= */}

        <section className="questions-summary">

          <div className="question-summary-card">

            <div className="summary-icon">
              ❓
            </div>

            <div>

              <span>
                Total Questions
              </span>

              <strong>
                {questions.length}
              </strong>

            </div>

          </div>

          <div className="question-summary-card">

            <div className="summary-icon">
              📚
            </div>

            <div>

              <span>
                Total Tests
              </span>

              <strong>
                {tests.length}
              </strong>

            </div>

          </div>

          <div className="question-summary-card">

            <div className="summary-icon">
              🔎
            </div>

            <div>

              <span>
                Showing
              </span>

              <strong>
                {filteredQuestions.length}
              </strong>

            </div>

          </div>

        </section>

        {/* ================= QUESTIONS ================= */}

        <section className="all-questions-panel">

          <div className="all-questions-header">

            <div>

              <h2>
                All Questions
              </h2>

              <p>
                View and manage questions
              </p>

            </div>

          </div>

          {loading ? (

            <div className="questions-loading">
              Loading questions...
            </div>

          ) : filteredQuestions.length === 0 ? (

            <div className="empty-questions">

              <div className="empty-question-icon">
                ❓
              </div>

              <h3>
                No questions found
              </h3>

              <p>
                Try changing your search or test filter.
              </p>

            </div>

          ) : (

            <div className="all-question-list">

              {filteredQuestions.map(
                (item, index) => (

                  <div
                    className="all-question-card"
                    key={item.id}
                  >

                    {/* TOP */}

                    <div className="all-question-top">

                      <div className="all-question-left">

                        <span className="all-question-number">
                          Question {index + 1}
                        </span>

                        <span className="all-question-test">
                          📚 {item.test_title}
                        </span>
                       <span className={`difficulty-badge ${item.difficulty?.toLowerCase() || "medium"}`}>
                       {item.difficulty || "Medium"}
                        </span>
                      </div>

                      <button
                        className="delete-question-btn"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                    {/* QUESTION */}

                    <h3>
                      {item.question}
                    </h3>

                    {/* OPTIONS */}

                    <div className="all-question-options">

                      <div
                        className={
                          item.correct_answer === "A"
                            ? "all-option correct"
                            : "all-option"
                        }
                      >

                        <span>A</span>

                        <p>
                          {item.option_a}
                        </p>

                      </div>

                      <div
                        className={
                          item.correct_answer === "B"
                            ? "all-option correct"
                            : "all-option"
                        }
                      >

                        <span>B</span>

                        <p>
                          {item.option_b}
                        </p>

                      </div>

                      <div
                        className={
                          item.correct_answer === "C"
                            ? "all-option correct"
                            : "all-option"
                        }
                      >

                        <span>C</span>

                        <p>
                          {item.option_c}
                        </p>

                      </div>

                      <div
                        className={
                          item.correct_answer === "D"
                            ? "all-option correct"
                            : "all-option"
                        }
                      >

                        <span>D</span>

                        <p>
                          {item.option_d}
                        </p>

                      </div>

                    </div>

                    {/* ANSWER */}

                    <div className="all-correct-answer">

                      ✓ Correct Answer:{" "}

                      <strong>
                        {item.correct_answer}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AllQuestions;