import React, { useEffect, useState } from "react";
import "./AdminNotifications.css";

const API_URL = "http://localhost:5000";

function AdminNotifications() {
  const [users, setUsers] = useState([]);

  const [target, setTarget] = useState("all");
  const [studentId, setStudentId] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);

  /* ================= FETCH STUDENTS ================= */

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingUsers(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      const response = await fetch(
  `${API_URL}/api/admin/users`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch students"
        );
      }

      setUsers(
  (data.users || []).filter(
    (user) => user.role !== "admin"
  )
);
    } catch (error) {
      console.error(
        "FETCH STUDENTS ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to load students."
      );

      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ================= SEND NOTIFICATION ================= */

  const handleSend = async (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle) {
      alert("Please enter notification title.");
      return;
    }

    if (!cleanMessage) {
      alert("Please enter notification message.");
      return;
    }

    if (target === "student" && !studentId) {
      alert("Please select a student.");
      return;
    }

    try {
      setSending(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/notifications`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            user_id:
              target === "all"
                ? null
                : Number(studentId),

            title: cleanTitle,
            message: cleanMessage,
            type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send notification."
        );
      }

      alert(
        target === "all"
          ? "Notification sent to all students successfully! 🔔"
          : "Notification sent to selected student successfully! 🔔"
      );

      /* RESET FORM */

      setTarget("all");
      setStudentId("");
      setTitle("");
      setMessage("");
      setType("announcement");
    } catch (error) {
      console.error(
        "SEND NOTIFICATION ERROR:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while sending notification."
      );
    } finally {
      setSending(false);
    }
  };

  /* ================= ICON ================= */

  const getNotificationIcon = () => {
    switch (type) {
      case "test":
        return "📚";

      case "success":
        return "🎉";

      case "certificate":
        return "🏆";

      case "announcement":
        return "📢";

      default:
        return "🔔";
    }
  };

  return (
    <div className="admin-notification-page">

      <div className="notification-card">

        {/* ================= HEADER ================= */}

        <div className="notification-page-header">

          <div className="notification-page-icon">
            🔔
          </div>

          <div className="notification-heading">

            <h1>
              Send Notification
            </h1>

            <p>
              Send important updates and
              announcements to students.
            </p>

          </div>

        </div>

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSend}
          className="notification-form"
        >

          {/* ================= SEND TO ================= */}

          <div className="form-group">

            <label className="form-label">
              Send To
            </label>

            <div className="target-options">

              {/* ALL STUDENTS */}

              <label
                className={`target-option ${
                  target === "all"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={target === "all"}
                  onChange={() => {
                    setTarget("all");
                    setStudentId("");
                  }}
                />

                <div className="target-icon">
                  👥
                </div>

                <div className="target-content">

                  <strong>
                    All Students
                  </strong>

                  <span>
                    Send notification to everyone
                  </span>

                </div>

              </label>

              {/* SPECIFIC STUDENT */}

              <label
                className={`target-option ${
                  target === "student"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="target"
                  value="student"
                  checked={
                    target === "student"
                  }
                  onChange={() =>
                    setTarget("student")
                  }
                />

                <div className="target-icon">
                  👤
                </div>

                <div className="target-content">

                  <strong>
                    Specific Student
                  </strong>

                  <span>
                    Send to one student
                  </span>

                </div>

              </label>

            </div>

          </div>

          {/* ================= STUDENT SELECT ================= */}

          {target === "student" && (

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="student"
              >
                Select Student
              </label>

              <div className="select-wrapper">

                <select
                  id="student"
                  value={studentId}
                  onChange={(event) =>
                    setStudentId(
                      event.target.value
                    )
                  }
                  disabled={loadingUsers}
                >

                  <option value="">
                    {loadingUsers
                      ? "Loading students..."
                      : "-- Select Student --"}
                  </option>

                  {users.map((student) => (

                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name ||
                        "Student"}{" "}
                      — {student.email}
                    </option>

                  ))}

                </select>

              </div>

              {!loadingUsers &&
                users.length === 0 && (

                  <p className="field-info error">
                    No students found.
                  </p>

                )}

              {!loadingUsers &&
                users.length > 0 && (

                  <p className="field-info">
                    {users.length} student
                    {users.length > 1
                      ? "s"
                      : ""}{" "}
                    available
                  </p>

                )}

            </div>

          )}

          {/* ================= TYPE + TITLE ================= */}

          <div className="form-row">

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="notification-type"
              >
                Notification Type
              </label>

              <select
                id="notification-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
              >

                <option value="announcement">
                  Announcement
                </option>

                <option value="general">
                  General
                </option>

                <option value="test">
                  New Test
                </option>

                <option value="success">
                  Success
                </option>

                <option value="certificate">
                  Certificate
                </option>

              </select>

            </div>

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="notification-title"
              >
                Title
              </label>

              <input
                id="notification-title"
                type="text"
                placeholder="Enter notification title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={255}
              />

              <div className="character-count">
                {title.length}/255
              </div>

            </div>

          </div>

          {/* ================= MESSAGE ================= */}

          <div className="form-group">

            <label
              className="form-label"
              htmlFor="notification-message"
            >
              Message
            </label>

            <textarea
              id="notification-message"
              placeholder="Write your notification message..."
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              rows={6}
              maxLength={2000}
            />

            <div className="character-count">
              {message.length}/2000
            </div>

          </div>

          {/* ================= PREVIEW ================= */}

          <div className="notification-preview">

            <div className="preview-heading">
              <span>
                Preview
              </span>

              <small>
                Student view
              </small>
            </div>

            <div className="preview-box">

              <div className="preview-icon">
                {getNotificationIcon()}
              </div>

              <div className="preview-content">

                <div className="preview-title">
                  {title.trim() ||
                    "Notification Title"}
                </div>

                <div className="preview-message">
                  {message.trim() ||
                    "Your notification message will appear here."}
                </div>

                <div className="preview-time">
                  Just now
                </div>

              </div>

            </div>

          </div>

          {/* ================= SEND BUTTON ================= */}

          <button
            type="submit"
            className="send-notification-btn"
            disabled={sending}
          >

            {sending ? (
              <>
                <span className="spinner"></span>
                Sending Notification...
              </>
            ) : (
              <>
                {getNotificationIcon()}
                <span>
                  Send Notification
                </span>
              </>
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminNotifications;