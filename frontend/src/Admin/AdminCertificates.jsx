import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminCertificates.css";

const API_URL = import.meta.env.VITE_API_URL || "https://testhub-backend-y450.onrender.com";

const AdminCertificates = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ================= ADMIN USER ================= */

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      setUser(storedUser);
    } catch (error) {
      console.error("User data error:", error);
    }
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  /* ================= FETCH CERTIFICATES ================= */

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/admin/certificates`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch certificates"
        );
      }

      setCertificates(data.certificates || []);
    } catch (error) {
      console.error(
        "Certificate fetch error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load certificates."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  /* ================= APPROVE ================= */

  const handleApprove = async (certificateId) => {
    try {
      setActionLoading(certificateId);
      setMessage("");

      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/admin/certificates/${certificateId}/approve`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to approve certificate"
        );
      }

      setMessage(
        "Certificate approved successfully."
      );

      setMessageType("success");

      await fetchCertificates();
    } catch (error) {
      console.error(
        "Approve certificate error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to approve certificate."
      );

      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= REJECT ================= */

  const handleReject = async (certificateId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this certificate?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(certificateId);
      setMessage("");

      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/admin/certificates/${certificateId}/reject`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject certificate"
        );
      }

      setMessage(
        "Certificate rejected successfully."
      );

      setMessageType("success");

      await fetchCertificates();
    } catch (error) {
      console.error(
        "Reject certificate error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to reject certificate."
      );

      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= SEARCH + FILTER ================= */

  const filteredCertificates = useMemo(() => {
    return certificates.filter((certificate) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(
          certificate.certificate_id || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          certificate.student_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          certificate.student_email || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          certificate.test_title || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        certificate.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    certificates,
    search,
    statusFilter,
  ]);

  /* ================= COUNTS ================= */

  const totalCertificates =
    certificates.length;

  const pendingCertificates =
    certificates.filter(
      (certificate) =>
        certificate.status === "Pending"
    ).length;

  const approvedCertificates =
    certificates.filter(
      (certificate) =>
        certificate.status === "Approved"
    ).length;

  const rejectedCertificates =
    certificates.filter(
      (certificate) =>
        certificate.status === "Rejected"
    ).length;

  /* ================= STATUS CLASS ================= */

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status-approved";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  /* ================= DATE ================= */

  const formatDate = (date) => {
    if (!date) {
      return "â€”";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "â€”";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "â€”";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "â€”";
    }

    return parsedDate.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* ================= SCORE ================= */

  const formatScore = (score) => {
    const value = Number(score);

    if (Number.isNaN(value)) {
      return "0%";
    }

    return `${value.toFixed(2)}%`;
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="admin-page">

        {/* SIDEBAR */}

        <aside className="admin-sidebar">

          <div className="admin-logo">
            ðŸŽ“
            <div>
              <strong>Online Test</strong>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <nav className="admin-menu">

            <Link
              to="/admin"
              className="admin-menu-item"
            >
              <span>ðŸ“Š</span>
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="admin-menu-item"
            >
              <span>ðŸ‘¥</span>
              Users
            </Link>

            <Link
              to="/admin/tests"
              className="admin-menu-item"
            >
              <span>ðŸ“</span>
              Tests
            </Link>

            <Link
              to="/admin/questions"
              className="admin-menu-item"
            >
              <span>â“</span>
              Questions
            </Link>

            <Link
              to="/admin/results"
              className="admin-menu-item"
            >
              <span>ðŸ“ˆ</span>
              Results
            </Link>

            <Link
              to="/admin/certificates"
              className="admin-menu-item active"
            >
              <span>ðŸ†</span>
              Certificates
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

        {/* LOADING */}

        <main className="admin-main">

          <div className="certificate-page-loading">
            <div className="certificate-loader"></div>
            <p>
              Loading certificate requests...
            </p>
          </div>

        </main>

      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <div className="admin-page">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-logo">

          <div className="admin-logo-icon">
            ðŸŽ“
          </div>

          <div>
            <strong>
              Online Test
            </strong>

            <span>
              ADMIN PANEL
            </span>
          </div>

        </div>

        {/* MENU */}

        <nav className="admin-menu">

          <Link
            to="/admin"
            className="admin-menu-item"
          >
            <span>ðŸ“Š</span>
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="admin-menu-item"
          >
            <span>ðŸ‘¥</span>
            Users
          </Link>

          <Link
            to="/admin/tests"
            className="admin-menu-item"
          >
            <span>ðŸ“</span>
            Tests
          </Link>

          <Link
            to="/admin/questions"
            className="admin-menu-item"
          >
            <span>â“</span>
            Questions
          </Link>

          <Link
            to="/admin/results"
            className="admin-menu-item"
          >
            <span>ðŸ“ˆ</span>
            Results
          </Link>

          <Link
            to="/admin/certificates"
            className="admin-menu-item active"
          >
            <span>ðŸ†</span>
            Certificates
          </Link>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="admin-sidebar-bottom">

          <Link
            to="/"
            className="view-website"
          >
            <span>ðŸŒ</span>
            View Website
          </Link>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <span>ðŸšª</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <div className="page-breadcrumb">
              Admin / Certificates
            </div>

            <h1>
              Certificate Management
            </h1>

            <p>
              Review, approve and manage
              student certificate requests.
            </p>

          </div>

          <div className="admin-header-right">

            <button
              className="refresh-certificates"
              onClick={fetchCertificates}
            >
              â†» Refresh
            </button>

            <div className="admin-profile">

              <div className="admin-avatar">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {user?.name || "Admin"}
                </strong>

                <span>
                  Administrator
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* MESSAGE */}

        {message && (
          <div
            className={`certificate-message ${messageType}`}
          >
            <span>
              {messageType === "success"
                ? "âœ“"
                : "!"}
            </span>

            <p>{message}</p>

            <button
              onClick={() => setMessage("")}
            >
              Ã—
            </button>
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <section className="certificate-stats">

          <div className="certificate-stat-card">

            <div className="certificate-stat-icon total">
              ðŸ“œ
            </div>

            <div>
              <span>
                Total Certificates
              </span>

              <strong>
                {totalCertificates}
              </strong>

              <small>
                All certificate requests
              </small>
            </div>

          </div>

          <div className="certificate-stat-card">

            <div className="certificate-stat-icon pending">
              â³
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingCertificates}
              </strong>

              <small>
                Waiting for approval
              </small>
            </div>

          </div>

          <div className="certificate-stat-card">

            <div className="certificate-stat-icon approved">
              âœ“
            </div>

            <div>
              <span>
                Approved
              </span>

              <strong>
                {approvedCertificates}
              </strong>

              <small>
                Certificates issued
              </small>
            </div>

          </div>

          <div className="certificate-stat-card">

            <div className="certificate-stat-icon rejected">
              âœ•
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {rejectedCertificates}
              </strong>

              <small>
                Rejected requests
              </small>
            </div>

          </div>

        </section>

        {/* =====================================================
            CERTIFICATE CONTENT
        ====================================================== */}

        <section className="certificate-content-card">

          {/* TOP */}

          <div className="certificate-content-header">

            <div>

              <h2>
                Certificate Requests
              </h2>

              <p>
                Students who scored 60% or above
                are eligible for certificates.
              </p>

            </div>

            <div className="certificate-total-label">
              {filteredCertificates.length}{" "}
              Requests
            </div>

          </div>

          {/* FILTER BAR */}

          <div className="certificate-filter-bar">

            {/* SEARCH */}

            <div className="certificate-search">

              <span>
                ðŸ”
              </span>

              <input
                type="text"
                placeholder="Search student, test or certificate ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Ã—
                </button>
              )}

            </div>

            {/* STATUS FILTER */}

            <div className="certificate-filter">

              <label>
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================== */}

          {filteredCertificates.length === 0 ? (

            <div className="certificate-empty">

              <div className="certificate-empty-icon">
                ðŸ“œ
              </div>

              <h3>
                No Certificate Requests
              </h3>

              <p>
                {search ||
                statusFilter !== "All"
                  ? "No certificates match your current search or filter."
                  : "Certificate requests will appear here when eligible students complete tests."}
              </p>

              {(search ||
                statusFilter !== "All") && (
                <button
                  className="clear-filter-btn"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <div className="certificate-table-wrapper">

              <table className="certificate-table">

                <thead>

                  <tr>

                    <th>
                      Certificate
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Test
                    </th>

                    <th>
                      Score
                    </th>

                    <th>
                      Grade
                    </th>

                    <th>
                      Requested
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCertificates.map(
                    (certificate) => (

                      <tr
                        key={certificate.id}
                      >

                        {/* CERTIFICATE */}

                        <td>

                          <div className="certificate-id-cell">

                            <div className="mini-certificate-icon">
                              ðŸ†
                            </div>

                            <div>

                              <strong>
                                {certificate.certificate_id ||
                                  `CERT-${certificate.id}`}
                              </strong>

                              <small>
                                ID #{certificate.id}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* STUDENT */}

                        <td>

                          <div className="certificate-student">

                            <div className="certificate-student-avatar">

                              {certificate.student_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}

                            </div>

                            <div>

                              <strong>
                                {certificate.student_name ||
                                  "Student"}
                              </strong>

                              <small>
                                {certificate.student_email ||
                                  "Email not available"}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* TEST */}

                        <td>

                          <div className="certificate-test">

                            <strong>
                              {certificate.test_title ||
                                "Test"}
                            </strong>

                            <small>
                              Test ID:{" "}
                              {certificate.test_id ||
                                "â€”"}
                            </small>

                          </div>

                        </td>

                        {/* SCORE */}

                        <td>

                          <div className="certificate-score">

                            <strong>
                              {formatScore(
                                certificate.score
                              )}
                            </strong>

                            <div className="score-progress">
                              <span
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      certificate.score
                                    ) || 0,
                                    100
                                  )}%`,
                                }}
                              ></span>
                            </div>

                          </div>

                        </td>

                        {/* GRADE */}

                        <td>

                          <span className="grade-badge">
                            {certificate.grade ||
                              "â€”"}
                          </span>

                        </td>

                        {/* REQUESTED */}

                        <td>

                          <div className="certificate-date">

                            <strong>
                              {formatDate(
                                certificate.requested_at
                              )}
                            </strong>

                            <small>
                              {formatDateTime(
                                certificate.requested_at
                              ).split(",")[1] ||
                                ""}
                            </small>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <div className="status-cell">

                            <span
                              className={`certificate-status ${getStatusClass(
                                certificate.status
                              )}`}
                            >
                              {certificate.status ||
                                "Pending"}
                            </span>

                            {Number(
                              certificate.auto_approved
                            ) === 1 && (
                              <small className="auto-approved-label">
                                âš¡ Auto Approved
                              </small>
                            )}

                            {certificate.approved_at && (
                              <small className="approved-date">
                                {formatDate(
                                  certificate.approved_at
                                )}
                              </small>
                            )}

                          </div>

                        </td>

                        {/* ACTION */}

                        <td>

                          {certificate.status ===
                          "Pending" ? (

                            <div className="certificate-actions">

                              <button
                                type="button"
                                className="approve-certificate-btn"
                                disabled={
                                  actionLoading ===
                                  certificate.id
                                }
                                onClick={() =>
                                  handleApprove(
                                    certificate.id
                                  )
                                }
                              >
                                {actionLoading ===
                                certificate.id
                                  ? "..."
                                  : "âœ“ Approve"}
                              </button>

                              <button
                                type="button"
                                className="reject-certificate-btn"
                                disabled={
                                  actionLoading ===
                                  certificate.id
                                }
                                onClick={() =>
                                  handleReject(
                                    certificate.id
                                  )
                                }
                              >
                                {actionLoading ===
                                certificate.id
                                  ? "..."
                                  : "âœ• Reject"}
                              </button>

                            </div>

                          ) : (

                            <span className="action-completed">
                              {certificate.status ===
                              "Approved"
                                ? "âœ“ Approved"
                                : "âœ• Rejected"}
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =====================================================
            INFO
        ====================================================== */}

        <section className="certificate-info-grid">

          <div className="certificate-info-card">

            <div className="info-icon">
              ðŸ’¡
            </div>

            <div>

              <h3>
                Certificate Eligibility
              </h3>

              <p>
                Students who score{" "}
                <strong>
                  60% or above
                </strong>{" "}
                automatically receive a
                certificate request.
              </p>

            </div>

          </div>

          <div className="certificate-info-card">

            <div className="info-icon">
              âš¡
            </div>

            <div>

              <h3>
                Automatic Approval
              </h3>

              <p>
                Pending certificates can be
                automatically approved after{" "}
                <strong>
                  12 hours
                </strong>{" "}
                if they have not been reviewed.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminCertificates;

