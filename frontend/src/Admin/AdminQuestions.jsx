import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import * as XLSX from "xlsx";

import "../AdminDashboard.css";
import "./AdminQuestions.css";

const API_URL = "${import.meta.env.VITE_API_URL}";

function AdminQuestions() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
  });

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (
      !token ||
      !user ||
      user.role !== "admin"
    ) {
      navigate("/login");
      return;
    }

    loadTest();
  }, [navigate, testId]);

  /* ================= LOAD TEST ================= */

  const loadTest = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/tests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to load test"
        );
        return;
      }

      const tests = data.tests || [];

      const currentTest = tests.find(
        (item) =>
          String(item.id) === String(testId)
      );

      setTest(currentTest || null);
    } catch (error) {
      console.error(
        "LOAD TEST ERROR:",
        error
      );

      alert(
        "Server error while loading test"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORM CHANGE ================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
    });
  };

  /* ================= ADD QUESTION ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.question.trim() ||
      !form.option_a.trim() ||
      !form.option_b.trim() ||
      !form.option_c.trim() ||
      !form.option_d.trim() ||
      !form.correct_answer
    ) {
      alert(
        "Please fill all question fields"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/tests/${testId}/questions`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            question:
              form.question.trim(),

            option_a:
              form.option_a.trim(),

            option_b:
              form.option_b.trim(),

            option_c:
              form.option_c.trim(),

            option_d:
              form.option_d.trim(),

            correct_answer:
              form.correct_answer,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to add question"
        );
        return;
      }

      alert(
        "Question added successfully!"
      );

      resetForm();
      await loadTest();
    } catch (error) {
      console.error(
        "ADD QUESTION ERROR:",
        error
      );

      alert(
        "Server error while adding question"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= EXCEL IMPORT ================= */

  const handleExcelImport = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    try {
      setImporting(true);

      const reader =
        new FileReader();

      reader.onload = async (event) => {
        try {
          const data =
            new Uint8Array(
              event.target.result
            );

          const workbook =
            XLSX.read(data, {
              type: "array",
            });

          const sheetName =
            workbook.SheetNames[0];

          const worksheet =
            workbook.Sheets[sheetName];

          const rows =
            XLSX.utils.sheet_to_json(
              worksheet,
              {
                defval: "",
              }
            );

          if (!rows.length) {
            alert(
              "Excel file is empty"
            );
            return;
          }

          const token =
            localStorage.getItem("token");

          let successCount = 0;
          let failedCount = 0;

          for (const row of rows) {
            const question =
              String(
                row.question || ""
              ).trim();

            const option_a =
              String(
                row.option_a || ""
              ).trim();

            const option_b =
              String(
                row.option_b || ""
              ).trim();

            const option_c =
              String(
                row.option_c || ""
              ).trim();

            const option_d =
              String(
                row.option_d || ""
              ).trim();

            const correct_answer =
              String(
                row.correct_answer || ""
              )
                .trim()
                .toUpperCase();

            if (
              !question ||
              !option_a ||
              !option_b ||
              !option_c ||
              !option_d ||
              !["A", "B", "C", "D"].includes(
                correct_answer
              )
            ) {
              failedCount++;
              continue;
            }

            try {
              const response =
                await fetch(
                  `${API_URL}/api/admin/tests/${testId}/questions`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                      question,
                      option_a,
                      option_b,
                      option_c,
                      option_d,
                      correct_answer,
                    }),
                  }
                );

              if (response.ok) {
                successCount++;
              } else {
                failedCount++;
              }
            } catch {
              failedCount++;
            }
          }

          alert(
            `Import completed!\n\nSuccessful: ${successCount}\nFailed: ${failedCount}`
          );

          await loadTest();
        } catch (error) {
          console.error(
            "EXCEL ERROR:",
            error
          );

          alert(
            "Invalid Excel file"
          );
        } finally {
          setImporting(false);
          e.target.value = "";
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(
        "IMPORT ERROR:",
        error
      );

      setImporting(false);
      e.target.value = "";

      alert(
        "Failed to import Excel file"
      );
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>

        <p>
          Loading questions...
        </p>
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

    <Link to="/admin" className="admin-menu-item">
      <span>📊</span>
      Dashboard
    </Link>

    <Link to="/admin/users" className="admin-menu-item">
      <span>👥</span>
      Users
    </Link>

    <Link to="/admin/tests" className="admin-menu-item">
      <span>📝</span>
      Tests
    </Link>

    <Link
      to="/admin/questions"
      className="admin-menu-item active"
    >
      <span>❓</span>
      Questions
    </Link>

    <Link to="/admin/results" className="admin-menu-item">
      <span>📈</span>
      Results
    </Link>

  </nav>

  <div className="admin-sidebar-bottom">

    <Link to="/" className="view-website">
      🌐 View Website
    </Link>

    <button
      type="button"
      className="admin-logout"
      onClick={logout}
    >
      🚪 Logout
    </button>

  </div>

</aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        <div className="admin-header">

          <div>
            <h1>
              Manage Questions
            </h1>

            <p>
              {test?.title ||
                "Test Questions"}
            </p>
          </div>

          <button
            type="button"
            className="admin-back-btn"
            onClick={() =>
              navigate("/admin/tests")
            }
          >
            ← Back to Tests
          </button>

        </div>

        {/* ================= TEST INFO ================= */}

        <div className="admin-stats-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              📝
            </div>

            <div>
              <span>
                Test
              </span>

              <strong>
                {test?.title ||
                  "Loading..."}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              ❓
            </div>

            <div>
              <span>
                Questions
              </span>

              <strong>
                {test?.question_count ??
                  0}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              ⏱️
            </div>

            <div>
              <span>
                Duration
              </span>

              <strong>
                {test?.duration ??
                  0}{" "}
                min
              </strong>
            </div>
          </div>

        </div>

        {/* ================= ADD QUESTION ================= */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>
              <h2>
                Add New Question
              </h2>

              <p>
                Create a multiple choice
                question
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="question-form"
          >

            <div className="form-group full-width">

              <label>
                Question
              </label>

              <textarea
                name="question"
                value={form.question}
                onChange={handleChange}
                placeholder="Enter question"
                rows="4"
              />

            </div>

            <div className="question-options">

              <div className="form-group">

                <label>
                  Option A
                </label>

                <input
                  type="text"
                  name="option_a"
                  value={form.option_a}
                  onChange={handleChange}
                  placeholder="Enter option A"
                />

              </div>

              <div className="form-group">

                <label>
                  Option B
                </label>

                <input
                  type="text"
                  name="option_b"
                  value={form.option_b}
                  onChange={handleChange}
                  placeholder="Enter option B"
                />

              </div>

              <div className="form-group">

                <label>
                  Option C
                </label>

                <input
                  type="text"
                  name="option_c"
                  value={form.option_c}
                  onChange={handleChange}
                  placeholder="Enter option C"
                />

              </div>

              <div className="form-group">

                <label>
                  Option D
                </label>

                <input
                  type="text"
                  name="option_d"
                  value={form.option_d}
                  onChange={handleChange}
                  placeholder="Enter option D"
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Correct Answer
              </label>

              <select
                name="correct_answer"
                value={
                  form.correct_answer
                }
                onChange={handleChange}
              >
                <option value="">
                  Select correct answer
                </option>

                <option value="A">
                  A
                </option>

                <option value="B">
                  B
                </option>

                <option value="C">
                  C
                </option>

                <option value="D">
                  D
                </option>
              </select>

            </div>

            <div className="question-actions">

              <button
                type="button"
                className="admin-secondary-btn"
                onClick={resetForm}
              >
                Clear
              </button>

              <button
                type="submit"
                className="admin-primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Adding..."
                  : "Add Question"}
              </button>

            </div>

          </form>

        </div>

        {/* ================= EXCEL IMPORT ================= */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>
              <h2>
                Import Questions from Excel
              </h2>

              <p>
                Upload an Excel file to
                add multiple questions
              </p>
            </div>

          </div>

          <div className="excel-import-box">

            <div className="excel-icon">
              📊
            </div>

            <h3>
              Upload Excel File
            </h3>

            <p>
              Required columns:
              question, option_a,
              option_b, option_c,
              option_d, correct_answer
            </p>

            <label className="excel-upload-btn">

              {importing
                ? "Importing..."
                : "Choose Excel File"}

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={
                  handleExcelImport
                }
                disabled={importing}
                hidden
              />

            </label>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminQuestions;
