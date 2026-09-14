import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "../AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AdminQuestions() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [form, setForm] = useState({
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  difficulty: "Medium",
});

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

    fetchTest();
  }, [testId]);

  /* ================= FETCH TEST ================= */

  const fetchTest = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/tests/${testId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch test"
        );
      }

      setTest(data.test);
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Failed to load test"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORM CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
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
      correct_answer: "A",
      difficulty: "Medium",
    });
  };

  /* ================= ADD QUESTION ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !form.question.trim() ||
      !form.option_a.trim() ||
      !form.option_b.trim() ||
      !form.option_c.trim() ||
      !form.option_d.trim()
    ) {
      setMessage(
        "Please fill all question and option fields."
      );

      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/admin/tests/${testId}/questions`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: form.question.trim(),
            option_a: form.option_a.trim(),
            option_b: form.option_b.trim(),
            option_c: form.option_c.trim(),
            option_d: form.option_d.trim(),
            correct_answer: form.correct_answer,
            difficulty: form.difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add question"
        );
      }

      setMessage(
        "Question added successfully."
      );

      setMessageType("success");

      resetForm();

      await fetchTest();
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Failed to add question"
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DOWNLOAD EXCEL TEMPLATE ================= */

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        question: "What is 25% of 240?",
        option_a: "50",
        option_b: "60",
        option_c: "70",
        option_d: "80",
        correct_answer: "B",
        difficulty: "Medium",
      },

      {
        question:
          "A number is increased from 200 to 250. What is the percentage increase?",
        option_a: "20%",
        option_b: "25%",
        option_c: "30%",
        option_d: "35%",
        correct_answer: "B",
        difficulty: "Medium",
      },

      {
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        difficulty: "Medium",
      },
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(templateData);

    worksheet["!cols"] = [
      { wch: 55 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 }
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Questions"
    );

    /* ================= INSTRUCTIONS ================= */

    const instructionData = [
      {
        Instruction:
          "1. Enter one question per row.",
      },

      {
        Instruction:
          "2. Fill all four options: option_a, option_b, option_c and option_d.",
      },

      {
        Instruction:
          "3. correct_answer must contain only A, B, C or D.",
      },

      {
        Instruction:
          "4. difficulty must contain only Easy, Medium or Hard.",
      },

      {
        Instruction:
          "5. Do not change the column names in the Questions sheet.",
      },

      {
        Instruction:
          "6. Save the file as .xlsx before importing.",
      },

      {
        Instruction:
          "7. Empty or invalid rows will not be imported.",
      },
    ];

    const instructionSheet =
      XLSX.utils.json_to_sheet(
        instructionData
      );

    instructionSheet["!cols"] = [
      { wch: 100 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      instructionSheet,
      "Instructions"
    );

    XLSX.writeFile(
      workbook,
      "Test_Questions_Template.xlsx"
    );
  };

  /* ================= IMPORT EXCEL ================= */

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setMessageType("");

    try {
      setSaving(true);

      /* Read Excel */

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
      });

      if (!workbook.SheetNames.length) {
        throw new Error(
          "Excel file does not contain any sheet."
        );
      }

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
        throw new Error(
          "Excel file is empty."
        );
      }

      /* Required columns */

      const requiredColumns = [
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer",
        "difficulty",
      ];

      const firstRow = rows[0];

      const missingColumns =
        requiredColumns.filter(
          (column) =>
            !(column in firstRow)
        );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing columns: ${missingColumns.join(
            ", "
          )}`
        );
      }

      let importedCount = 0;
      let skippedCount = 0;

      /* ================= IMPORT EACH ROW ================= */

      for (const row of rows) {
        const question = String(
          row.question || ""
        ).trim();

        const optionA = String(
          row.option_a || ""
        ).trim();

        const optionB = String(
          row.option_b || ""
        ).trim();

        const optionC = String(
          row.option_c || ""
        ).trim();

        const optionD = String(
          row.option_d || ""
        ).trim();

        const correctAnswer = String(
          row.correct_answer || ""
        )
          .trim()
          .toUpperCase();

        const difficultyRaw = String(
          row.difficulty || "Medium"
        ).trim();

        const difficulty = ["Easy", "Medium", "Hard"].includes(
          difficultyRaw
        )
          ? difficultyRaw
          : "Medium";

        /* Validate row */

        if (
          !question ||
          !optionA ||
          !optionB ||
          !optionC ||
          !optionD ||
          !["A", "B", "C", "D"].includes(
            correctAnswer
          )
        ) {
          skippedCount++;
          continue;
        }

        /* Send question to backend */

        const response = await fetch(
          `${API_URL}/api/admin/tests/${testId}/questions`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              question,
              option_a: optionA,
              option_b: optionB,
              option_c: optionC,
              option_d: optionD,
              correct_answer: correctAnswer,
              difficulty,
            }),
          }
        );

        if (response.ok) {
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      /* Refresh test information */

      await fetchTest();

      setMessage(
        `${importedCount} question${
          importedCount !== 1
            ? "s"
            : ""
        } imported successfully${
          skippedCount > 0
            ? `, ${skippedCount} skipped.`
            : "."
        }`
      );

      setMessageType(
        importedCount > 0
          ? "success"
          : "error"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          "Failed to import Excel file."
      );

      setMessageType("error");
    } finally {
      setSaving(false);

      event.target.value = "";
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ================= LOADING ================= */

  if (loading && !test) {
    return (
      <div className="loading-page">
        Loading Questions...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="admin-page">

      {/* ================= SIDEBAR ================= */}

     <aside className="admin-sidebar">

  {/* LOGO */}

  <div className="admin-logo">
    Online Test
    <span>ADMIN PANEL</span>
  </div>

  {/* MENU */}

  <nav className="admin-menu">

    <Link
      to="/admin"
      className="admin-menu-item"
    >
      <span>📊</span>
      Dashboard
    </Link>

    <Link
      to="/admin/users"
      className="admin-menu-item"
    >
      <span>👥</span>
      Users
    </Link>

    <Link
      to="/admin/tests"
      className="admin-menu-item"
    >
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

    <Link
      to="/admin/results"
      className="admin-menu-item"
    >
      <span>📈</span>
      Results
    </Link>

  </nav>

  {/* BOTTOM MENU */}

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
              Manage Questions
            </h1>

            <p>
              Add and manage questions for this test
            </p>
          </div>

          {/* HEADER BUTTONS */}

          <div className="questions-header-actions">

            {/* EXCEL TEMPLATE */}

            <button
              type="button"
              className="excel-template-btn"
              onClick={
                downloadExcelTemplate
              }
              disabled={saving}
            >
              📥 Excel Template
            </button>

            {/* IMPORT EXCEL */}

            <label
              className={`excel-import-btn ${
                saving ? "disabled" : ""
              }`}
            >
              📤 Import Excel

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={
                  handleExcelImport
                }
                hidden
                disabled={saving}
              />
            </label>

            {/* REFRESH */}

            <button
              type="button"
              className="refresh-btn"
              onClick={fetchTest}
              disabled={saving}
            >
              🔄 Refresh
            </button>

            {/* ADD QUESTION */}

            <button
              type="button"
              className="create-test-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              disabled={saving}
            >
              + Add Question
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
                ? "✓"
                : "⚠"}
            </span>

            <p>{message}</p>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setMessageType("");
              }}
            >
              ×
            </button>

          </div>
        )}

        {/* ================= TEST INFO ================= */}

        {test && (
          <section className="question-test-info">

            <div className="question-test-icon">
              📚
            </div>

            <div className="question-test-details">

              <h2>
                {test.title}
              </h2>

              <p>
                {test.category ||
                  "General"}{" "}
                • {test.duration} minutes •{" "}
                {test.total_questions || 0}{" "}
                questions
              </p>

            </div>

            <div className="question-count-box">

              <strong>
                {test.total_questions || 0}
              </strong>

              <span>
                Questions
              </span>

            </div>

          </section>
        )}

        {/* ================= ADD QUESTION FORM ================= */}

        {showForm && (
          <section className="question-form-card">

            <div className="question-form-header">

              <div>

                <h2>
                  Add New Question
                </h2>

                <p>
                  Create a multiple choice question
                </p>

              </div>

              <button
                type="button"
                className="close-question-form"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="question-form"
            >

              {/* QUESTION */}

              <div className="question-field full-width">

                <label>
                  Question
                </label>

                <textarea
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  placeholder="Enter question..."
                  rows="4"
                  required
                />

              </div>

              {/* OPTIONS */}

              <div className="question-options-grid">

                <div className="question-field">

                  <label>
                    Option A
                  </label>

                  <input
                    type="text"
                    name="option_a"
                    value={form.option_a}
                    onChange={handleChange}
                    placeholder="Enter option A"
                    required
                  />

                </div>

                <div className="question-field">

                  <label>
                    Option B
                  </label>

                  <input
                    type="text"
                    name="option_b"
                    value={form.option_b}
                    onChange={handleChange}
                    placeholder="Enter option B"
                    required
                  />

                </div>

                <div className="question-field">

                  <label>
                    Option C
                  </label>

                  <input
                    type="text"
                    name="option_c"
                    value={form.option_c}
                    onChange={handleChange}
                    placeholder="Enter option C"
                    required
                  />

                </div>

                <div className="question-field">

                  <label>
                    Option D
                  </label>

                  <input
                    type="text"
                    name="option_d"
                    value={form.option_d}
                    onChange={handleChange}
                    placeholder="Enter option D"
                    required
                  />

                </div>

              </div>

              {/* CORRECT ANSWER */}

              <div className="question-field">

                <label>
                  Correct Answer
                </label>

                <select
                  name="correct_answer"
                  value={form.correct_answer}
                  onChange={handleChange}
                >

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

              {/* DIFFICULTY */}

              <div className="question-field">
                <label>
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* FORM BUTTONS */}

              <div className="question-form-actions">

                <button
                  type="button"
                  className="cancel-question-btn"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-question-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "✓ Add Question"}
                </button>

              </div>

            </form>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminQuestions;