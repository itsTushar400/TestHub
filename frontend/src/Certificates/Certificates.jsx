import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Certificates.css";

const API_URL = "http://localhost:5000";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(2)}%` : "0.00%";
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "approved") return "mycert-status-approved";
  if (normalized === "rejected") return "mycert-status-rejected";
  return "mycert-status-pending";
}

export default function Certificates() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCertificates = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/api/certificates`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();

      let data = {};

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error("Server returned invalid JSON.");
        }
      } else {
        if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
          throw new Error(
            "Backend API /api/certificates is not available. Restart the backend server."
          );
        }

        throw new Error(rawText || "Failed to load certificates.");
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load certificates."
        );
      }

      setCertificates(
        Array.isArray(data)
          ? data
          : Array.isArray(data.certificates)
          ? data.certificates
          : []
      );
    } catch (err) {
      console.error("Certificates Error:", err);
      setError(err.message || "Unable to load certificates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const approvedCertificates = useMemo(
    () =>
      certificates.filter(
        (item) =>
          String(item.status || "").toLowerCase() === "approved"
      ),
    [certificates]
  );

  const bestScore = useMemo(() => {
    if (!certificates.length) return 0;

    return Math.max(
      ...certificates.map((item) => Number(item.score) || 0)
    );
  }, [certificates]);

  const handleViewCertificate = (resultId) => {
    if (!resultId) return;
    navigate(`/certificate/${resultId}`);
  };

  if (loading) {
    return (
      <div className="mycert-page">
        <div className="mycert-loading">
          <div className="mycert-spinner"></div>
          <h3>Loading Certificates...</h3>
          <p>Please wait while we fetch your achievements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mycert-page">
      <div className="mycert-topbar">
        <button
          type="button"
          className="mycert-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <span>←</span>
          Dashboard
        </button>

        <button
          type="button"
          className="mycert-refresh-btn"
          onClick={() => fetchCertificates(true)}
          disabled={refreshing}
        >
          <span className={refreshing ? "mycert-refresh-spin" : ""}>↻</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="mycert-hero">
        <div className="mycert-hero-left">
          <div className="mycert-hero-badge">
            🏆 &nbsp; ACHIEVEMENTS
          </div>

          <h1>My Certificates</h1>

          <p>
            Your learning achievements, milestones and earned
            certifications are all collected here.
          </p>
        </div>

        <div className="mycert-hero-trophy">🏆</div>

        <div className="mycert-hero-decoration mycert-decoration-one">
          🏆
        </div>
      </section>

      {error && (
        <div className="mycert-error">
          <div className="mycert-error-symbol">!</div>

          <div className="mycert-error-content">
            <strong>Unable to load certificates</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => fetchCertificates()}
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <>
          <section className="mycert-stats">
            <div className="mycert-stat-card">
              <div className="mycert-stat-icon mycert-purple">🏆</div>
              <div className="mycert-stat-content">
                <span>Total Certificates</span>
                <strong>
                  {String(certificates.length).padStart(2, "0")}
                </strong>
              </div>
            </div>

            <div className="mycert-stat-card">
              <div className="mycert-stat-icon mycert-green">✓</div>
              <div className="mycert-stat-content">
                <span>Approved</span>
                <strong>
                  {String(approvedCertificates.length).padStart(2, "0")}
                </strong>
              </div>
            </div>

            <div className="mycert-stat-card">
              <div className="mycert-stat-icon mycert-orange">★</div>
              <div className="mycert-stat-content">
                <span>Best Score</span>
                <strong>{formatScore(bestScore).replace(".00", "")}</strong>
              </div>
            </div>
          </section>

          <section className="mycert-section-heading">
            <div>
              <span>YOUR ACHIEVEMENTS</span>
              <h2>Earned Certificates</h2>
            </div>

            <p>
              {certificates.length}{" "}
              {certificates.length === 1 ? "certificate" : "certificates"}{" "}
              found
            </p>
          </section>

          {certificates.length === 0 ? (
            <div className="mycert-empty">
              <div className="mycert-empty-trophy">🏆</div>
              <h2>No Certificates Yet</h2>
              <p>
                Complete a test with at least 60% marks to become
                eligible for a certificate.
              </p>

              <button
                type="button"
                onClick={() => navigate("/tests")}
              >
                Browse Tests <span>→</span>
              </button>
            </div>
          ) : (
            <section className="mycert-list">
              {certificates.map((certificate) => {
                const status = String(
                  certificate.status || "Pending"
                );
                const approved =
                  status.toLowerCase() === "approved";
                const rejected =
                  status.toLowerCase() === "rejected";

                return (
                  <article
                    className="mycert-card"
                    key={
                      certificate.id ||
                      certificate.certificate_id ||
                      certificate.result_id
                    }
                  >
                    <div className="mycert-card-strip">
                      <div className="mycert-strip-brand">
                        <div className="mycert-brand-mark">TH</div>

                        <div>
                          <strong>TestHub</strong>
                          <span>Online Test &amp; Learning</span>
                        </div>
                      </div>

                      <span
                        className={`mycert-status ${statusClass(status)}`}
                      >
                        {approved ? "✓ " : ""}
                        {status}
                      </span>
                    </div>

                    <div className="mycert-main">
                      <div className="mycert-emblem">
                        <div>🏆</div>
                      </div>

                      <div className="mycert-info">
                        <div className="mycert-label">
                          CERTIFICATE OF ACHIEVEMENT
                        </div>

                        <h2>
                          {certificate.test_title ||
                            "Completed Assessment"}
                        </h2>

                        <p className="mycert-message">
                          Congratulations! You have successfully
                          completed this assessment and earned this
                          certificate of achievement.
                        </p>

                        <div className="mycert-details-grid">
                          <div className="mycert-detail">
                            <span>SCORE</span>
                            <strong>
                              {formatScore(certificate.score)}
                            </strong>
                          </div>

                          <div className="mycert-detail">
                            <span>GRADE</span>
                            <strong>
                              {certificate.grade || "—"}
                            </strong>
                          </div>

                          <div className="mycert-detail">
                            <span>CERTIFICATE ID</span>
                            <strong>
                              {certificate.certificate_id || "—"}
                            </strong>
                          </div>

                          <div className="mycert-detail">
                            <span>ISSUED ON</span>
                            <strong>
                              {formatDate(
                                certificate.issued_at ||
                                  certificate.approved_at ||
                                  certificate.requested_at
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mycert-card-footer">
                      <div className="mycert-achievement-note">
                        <span>✓</span>

                        <div>
                          <strong>
                            {approved
                              ? "Achievement Verified"
                              : rejected
                              ? "Certificate Rejected"
                              : "Certificate Under Review"}
                          </strong>

                          <small>
                            {approved
                              ? "This certificate has been approved."
                              : rejected
                              ? "Please contact the administrator for details."
                              : "Waiting for certificate approval."}
                          </small>
                        </div>
                      </div>

                      {approved ? (
                        <button
                          type="button"
                          className="mycert-view-btn"
                          onClick={() =>
                            handleViewCertificate(
                              certificate.result_id
                            )
                          }
                          disabled={!certificate.result_id}
                        >
                          View Certificate <span>→</span>
                        </button>
                      ) : rejected ? (
                        <button
                          type="button"
                          className="mycert-rejected-btn"
                          disabled
                        >
                          Rejected
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mycert-pending-btn"
                          disabled
                        >
                          Pending Approval
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}
