import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./Certificate.css";

const API_URL = "http://localhost:5000";

const Certificate = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // GET CERTIFICATE
  // =========================
  useEffect(() => {
    const getCertificate = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/certificates/${resultId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Certificate not available"
          );
        }

        setCertificate(data.certificate || data);
      } catch (err) {
        console.error("Certificate Error:", err);
        setError(
          err.message || "Certificate not available"
        );
      } finally {
        setLoading(false);
      }
    };

    getCertificate();
  }, [resultId]);

  // =========================
  // PRINT CERTIFICATE
  // =========================
  const printCertificate = () => {
    window.print();
  };

  // =========================
  // BACK TO DASHBOARD
  // =========================
  const backToDashboard = () => {
    navigate("/dashboard");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="certificate-page">
        <div className="certificate-loading">
          <div className="loading-circle"></div>

          <h2>Loading Certificate...</h2>

          <p>
            Please wait while we load your certificate.
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
      <div className="certificate-page">
        <div className="certificate-message">
          <div className="message-icon rejected">
            ×
          </div>

          <h2>Certificate Not Available</h2>

          <p>{error}</p>

          <button onClick={backToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // NO CERTIFICATE
  // =========================
  if (!certificate) {
    return (
      <div className="certificate-page">
        <div className="certificate-message">
          <div className="message-icon">
            !
          </div>

          <h2>Certificate Not Found</h2>

          <p>
            We could not find a certificate for this result.
          </p>

          <button onClick={backToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PENDING
  // =========================
  if (certificate.status === "Pending") {
    return (
      <div className="certificate-page">
        <div className="certificate-message">
          <div className="message-icon">
            ⏳
          </div>

          <h2>Certificate Under Review</h2>

          <p>
            Your certificate request has been submitted.
            Please wait for admin approval.
          </p>

          <div className="pending-id">
            <span>Certificate ID</span>

            <strong>
              {certificate.certificate_id}
            </strong>
          </div>

          <button onClick={backToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // REJECTED
  // =========================
  if (certificate.status === "Rejected") {
    return (
      <div className="certificate-page">
        <div className="certificate-message">
          <div className="message-icon rejected">
            ×
          </div>

          <h2>Certificate Rejected</h2>

          <p>
            This certificate request has been rejected.
          </p>

          <button onClick={backToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // CERTIFICATE DATA
  // =========================

  const studentName =
    certificate.student_name || "Student Name";

  const testTitle =
    certificate.test_title || "Online Test";

  const score = Number(
    certificate.score || 0
  );

  const grade =
    certificate.grade || "B";

  const certificateId =
    certificate.certificate_id ||
    `OT-${new Date().getFullYear()}-${String(
      resultId
    ).padStart(6, "0")}`;

  // =========================
  // REAL QR VERIFICATION URL
  // =========================
  const verificationUrl =
    `${window.location.origin}/verify-certificate/${encodeURIComponent(
      certificateId
    )}`;

  const dateValue =
    certificate.approved_at ||
    certificate.issued_at ||
    certificate.requested_at;

  const completedDate = dateValue
    ? new Date(dateValue).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

  // =========================
  // MAIN CERTIFICATE
  // =========================

  return (
    <div className="certificate-page">

      {/* ==================================
          SCREEN BUTTONS
      ================================== */}

      <div className="certificate-controls">

        <button
          className="back-result-btn"
          onClick={backToDashboard}
        >
          ← Back to Dashboard
        </button>

        <button
          className="print-certificate-btn"
          onClick={printCertificate}
        >
          🖨 Print / Save PDF
        </button>

      </div>

      {/* ==================================
          CERTIFICATE
      ================================== */}

      <div className="certificate-holder">

        <div className="certificate">

          {/* ================================
              CORNER DESIGN
          ================================= */}

          <div className="corner-top"></div>

          <div className="corner-top-gold"></div>

          <div className="corner-bottom"></div>

          <div className="corner-bottom-gold"></div>

          {/* ================================
              BORDER
          ================================= */}

          <div className="certificate-border"></div>

          {/* ================================
              LOGO
          ================================= */}

          <div className="online-test-logo">

            <div className="logo-round">
              OT
            </div>

            <div className="logo-content">

              <div className="logo-title">
                Online Test
              </div>

              <div className="logo-subtitle">
                LEARN • TEST • ACHIEVE
              </div>

            </div>

          </div>

          {/* ================================
              RIGHT BLUE STRIP
          ================================= */}

          <div className="right-strip">

            <div className="strip-text">
              O N L I N E
            </div>

            <div className="strip-title">
              TEST
            </div>

            <div className="strip-line"></div>

            <div className="strip-tail"></div>

          </div>

          {/* ================================
              VERIFIED SEAL
          ================================= */}

          <div className="verified-seal">

            <div className="seal-gold">

              <div className="seal-blue">

                <div className="seal-star">
                  ★
                </div>

                <div className="seal-verified">
                  VERIFIED
                </div>

                <div className="seal-certificate">
                  CERTIFICATE
                </div>

                <div className="seal-check">
                  ✓
                </div>

              </div>

            </div>

          </div>

          {/* ================================
              MAIN
          ================================= */}

          <div className="certificate-main">

            <h1>
              CERTIFICATE
            </h1>

            <div className="completion-heading">

              <span></span>

              <h2>
                OF COMPLETION
              </h2>

              <span></span>

            </div>

            <div className="presented">
              THIS CERTIFICATE IS PRESENTED TO
            </div>

            <div className="student-name">
              {studentName}
            </div>

            <div className="student-line"></div>

            <div className="certificate-description">

              For successfully completing the online assessment

              <br />

              and demonstrating knowledge and understanding in

            </div>

            <div className="test-title">
              {testTitle}
            </div>

            {/* ================================
                SCORE
            ================================= */}

            <div className="certificate-results">

              <div className="result-item">

                <span>
                  SCORE
                </span>

                <strong>
                  {score.toFixed(0)}%
                </strong>

              </div>

              <div className="result-separator"></div>

              <div className="result-item">

                <span>
                  GRADE
                </span>

                <strong>
                  {grade}
                </strong>

              </div>

              <div className="result-separator"></div>

              <div className="result-item completed-date">

                <span>
                  COMPLETED ON
                </span>

                <strong>
                  {completedDate}
                </strong>

              </div>

            </div>

          </div>

          {/* ================================
              SIGNATURE
          ================================= */}

          <div className="signature-block">

            <div className="signature-writing">
              {studentName}
            </div>

            <div className="signature-line"></div>

            <div className="signature-label">
              AUTHORIZED SIGNATURE
            </div>

            <div className="signature-person">
              {studentName}
            </div>

          </div>

          {/* ================================
              ISSUED BY
          ================================= */}

          <div className="issued-block">

            <div className="issued-check">
              ✓
            </div>

            <div className="issued-content">

              <span>
                Issued by
              </span>

              <strong>
                Online Test Academy
              </strong>

            </div>

          </div>

          {/* ================================
              REAL QR CODE
          ================================= */}

          <div className="certificate-qr">

            <QRCodeSVG
              value={verificationUrl}
              size={90}
              level="H"
              includeMargin={true}
            />

            <span>
              SCAN TO VERIFY
            </span>

          </div>

          {/* ================================
              CERTIFICATE ID
          ================================= */}

          <div className="certificate-id">

            Certificate ID:

            <strong>
              {certificateId}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Certificate;