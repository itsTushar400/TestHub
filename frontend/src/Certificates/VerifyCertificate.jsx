import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VerifyCertificate.css";

const API_URL = "http://localhost:5000";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        setError("");
        setCertificate(null);

        const cleanId = decodeURIComponent(
          certificateId || ""
        );

        const res = await fetch(
          `${API_URL}/api/verify-certificate/${encodeURIComponent(
            cleanId
          )}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Certificate verification failed"
          );
        }

        if (!data.verified) {
          throw new Error(
            data.message ||
              "Certificate could not be verified"
          );
        }

        setCertificate(data.certificate);
      } catch (err) {
        console.error(
          "Certificate verification error:",
          err
        );

        setError(
          err.message ||
            "Unable to verify certificate"
        );
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    } else {
      setLoading(false);
      setError("Certificate ID is missing.");
    }
  }, [certificateId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="verify-page">

        <div className="verify-loading-card">

          <div className="verify-spinner"></div>

          <h2>
            Verifying Certificate
          </h2>

          <p>
            Please wait while we verify
            the certificate details.
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="verify-page">

        <div className="verify-error-card">

          <div className="verify-error-icon">
            ×
          </div>

          <div className="verify-error-badge">
            VERIFICATION FAILED
          </div>

          <h1>
            Certificate Not Verified
          </h1>

          <p>
            {error}
          </p>

          <div className="verify-search-id">
            <span>
              Certificate ID
            </span>

            <strong>
              {certificateId || "Not available"}
            </strong>
          </div>

          <button
            className="verify-home-btn"
            onClick={() => navigate("/")}
          >
            ← Go to Home
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // VERIFIED
  // =========================

  return (
    <div className="verify-page">

      {/* =================================
          HEADER
      ================================= */}

      <header className="verify-header">

        <div
          className="verify-brand"
          onClick={() => navigate("/")}
        >

          <div className="verify-logo">
            OT
          </div>

          <div>
            <div className="verify-brand-name">
              Online Test
            </div>

            <div className="verify-brand-tagline">
              LEARN • TEST • ACHIEVE
            </div>
          </div>

        </div>

        <div className="verify-header-status">
          <span className="verify-status-dot"></span>
          Certificate Verification
        </div>

      </header>

      {/* =================================
          MAIN
      ================================= */}

      <main className="verify-container">

        <div className="verify-card">

          {/* SUCCESS ICON */}

          <div className="verify-success-icon">
            ✓
          </div>

          <div className="verify-success-badge">
            ✓ VERIFIED CERTIFICATE
          </div>

          <h1>
            Certificate Verified Successfully
          </h1>

          <p className="verify-subtitle">
            This certificate has been issued by
            Online Test Academy and its details
            have been successfully verified.
          </p>

          {/* =================================
              CERTIFICATE ID
          ================================= */}

          <div className="verify-certificate-id">

            <span>
              CERTIFICATE ID
            </span>

            <strong>
              {certificate.certificate_id}
            </strong>

          </div>

          {/* =================================
              STUDENT
          ================================= */}

          <div className="verify-student">

            <div className="verify-student-avatar">
              {certificate.student_name
                ?.charAt(0)
                ?.toUpperCase() || "S"}
            </div>

            <div className="verify-student-info">

              <span>
                CERTIFICATE HOLDER
              </span>

              <strong>
                {certificate.student_name}
              </strong>

            </div>

          </div>

          {/* =================================
              DETAILS
          ================================= */}

          <div className="verify-details">

            <div className="verify-detail-card">

              <span>
                TEST / ASSESSMENT
              </span>

              <strong>
                {certificate.test_title}
              </strong>

            </div>

            <div className="verify-detail-card">

              <span>
                SCORE
              </span>

              <strong>
                {Number(
                  certificate.score || 0
                ).toFixed(0)}
                %
              </strong>

            </div>

            <div className="verify-detail-card">

              <span>
                GRADE
              </span>

              <strong>
                {certificate.grade}
              </strong>

            </div>

            <div className="verify-detail-card">

              <span>
                STATUS
              </span>

              <strong className="verified-text">
                ✓ Approved
              </strong>

            </div>

          </div>

          {/* =================================
              DATE
          ================================= */}

          <div className="verify-date-row">

            <div>

              <span>
                ISSUED / APPROVED ON
              </span>

              <strong>
                {certificate.approved_at
                  ? new Date(
                      certificate.approved_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : certificate.issued_at
                  ? new Date(
                      certificate.issued_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "—"}
              </strong>

            </div>

            <div className="verify-check-mark">
              ✓
            </div>

          </div>

          {/* =================================
              AUTHENTICITY
          ================================= */}

          <div className="verify-authenticity">

            <div className="verify-auth-icon">
              ✓
            </div>

            <div>

              <strong>
                Authentic Certificate
              </strong>

              <p>
                The certificate ID and
                certificate information match
                our official records.
              </p>

            </div>

          </div>

          {/* =================================
              FOOTER
          ================================= */}

          <div className="verify-card-footer">

            <span>
              Issued by
            </span>

            <strong>
              Online Test Academy
            </strong>

          </div>

        </div>

        {/* =================================
            BOTTOM NOTE
        ================================= */}

        <div className="verify-bottom-note">

          <span>🔒</span>

          <p>
            This verification page is publicly
            accessible so that employers,
            institutions and other organizations
            can verify the authenticity of a
            certificate.
          </p>

        </div>

      </main>

    </div>
  );
};

export default VerifyCertificate;