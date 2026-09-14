import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TestInstructions.css";

const API = "http://localhost:5000";

function TestInstructions() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isEnglish = language === "english";

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API}/api/tests/${testId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Test not found"
          );
        }

        setTest(data.test);
      } catch (err) {
        console.error("Instruction Error:", err);
        setError("Unable to load test details.");
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setAgreed(false);
  };

  const handleStartTest = () => {
    if (!agreed) return;

    sessionStorage.setItem(
      `testStarted_${testId}`,
      "true"
    );

    navigate(`/test/${testId}`);
  };

  const instructions = isEnglish
    ? [
        {
          number: "01",
          title: "Test Duration",
          text: "Complete the test within the given time limit. The timer starts only after you click Start Test.",
        },
        {
          number: "02",
          title: "Read Questions Carefully",
          text: "Read every question carefully before selecting your answer.",
        },
        {
          number: "03",
          title: "Select One Answer",
          text: "Select the most appropriate answer for each question.",
        },
        {
          number: "04",
          title: "Timer",
          text: "Keep an eye on the remaining time while answering questions.",
        },
        {
          number: "05",
          title: "Time Over",
          text: "When the time expires, the test will be automatically submitted.",
        },
        {
          number: "06",
          title: "Do Not Refresh",
          text: "Do not refresh or reload the browser page while attempting the test.",
        },
        {
          number: "07",
          title: "Do Not Close the Test",
          text: "Do not close the browser tab or leave the test page during the examination.",
        },
        {
          number: "08",
          title: "Changing Answers",
          text: "You can change your selected answer before submitting the test.",
        },
        {
          number: "09",
          title: "Review Answers",
          text: "Review your answers carefully before clicking the final Submit Test button.",
        },
        {
          number: "10",
          title: "Final Submission",
          text: "Once submitted, your answers will be evaluated and your result will be generated.",
        },
        {
          number: "11",
          title: "Result",
          text: "Your score, percentage and test status will be displayed after successful submission.",
        },
        {
          number: "12",
          title: "Certificate",
          text: "Students meeting the required passing criteria may be eligible for a certificate.",
        },
        {
          number: "13",
          title: "Internet Connection",
          text: "Make sure you have a stable internet connection before starting the test.",
        },
        {
          number: "14",
          title: "Fair Attempt",
          text: "Attempt the test honestly and do not use unauthorized assistance.",
        },
      ]
    : [
        {
          number: "01",
          title: "परीक्षा अवधि",
          text: "परीक्षा दिए गए समय के अंदर पूरी करनी होगी। टाइमर केवल Start Test पर क्लिक करने के बाद शुरू होगा।",
        },
        {
          number: "02",
          title: "प्रश्न ध्यान से पढ़ें",
          text: "उत्तर चुनने से पहले प्रत्येक प्रश्न को ध्यान से पढ़ें।",
        },
        {
          number: "03",
          title: "एक उत्तर चुनें",
          text: "प्रत्येक प्रश्न के लिए सबसे उपयुक्त उत्तर चुनें।",
        },
        {
          number: "04",
          title: "टाइमर",
          text: "प्रश्नों का उत्तर देते समय बचे हुए समय पर ध्यान रखें।",
        },
        {
          number: "05",
          title: "समय समाप्त",
          text: "समय समाप्त होने पर परीक्षा अपने आप submit हो जाएगी।",
        },
        {
          number: "06",
          title: "पेज Refresh न करें",
          text: "परीक्षा देते समय browser page को refresh या reload न करें।",
        },
        {
          number: "07",
          title: "टेस्ट बंद न करें",
          text: "परीक्षा के दौरान browser tab बंद न करें और test page से बाहर न जाएँ।",
        },
        {
          number: "08",
          title: "उत्तर बदलना",
          text: "Test submit करने से पहले आप अपना selected answer बदल सकते हैं।",
        },
        {
          number: "09",
          title: "उत्तर जाँचें",
          text: "Final Submit Test पर क्लिक करने से पहले अपने सभी उत्तरों की जाँच करें।",
        },
        {
          number: "10",
          title: "अंतिम सबमिशन",
          text: "Submit करने के बाद आपके answers evaluate किए जाएंगे और result generate होगा।",
        },
        {
          number: "11",
          title: "परिणाम",
          text: "Successful submission के बाद आपका score, percentage और status दिखाई देगा।",
        },
        {
          number: "12",
          title: "प्रमाणपत्र",
          text: "Passing criteria पूरा करने वाले students certificate के लिए eligible हो सकते हैं।",
        },
        {
          number: "13",
          title: "इंटरनेट कनेक्शन",
          text: "Test शुरू करने से पहले सुनिश्चित करें कि आपका internet connection stable है।",
        },
        {
          number: "14",
          title: "ईमानदारी से परीक्षा दें",
          text: "परीक्षा ईमानदारी से दें और unauthorized assistance का उपयोग न करें।",
        },
      ];

  const beforeStart = isEnglish
    ? [
        "Make sure your internet connection is stable.",
        "Keep enough time to complete the test.",
        "Read each question carefully.",
        "Do not refresh or close the test page.",
        "Review your answers before final submission.",
      ]
    : [
        "सुनिश्चित करें कि आपका internet connection stable है।",
        "टेस्ट पूरा करने के लिए पर्याप्त समय रखें।",
        "प्रत्येक प्रश्न को ध्यान से पढ़ें।",
        "Test page को refresh या close न करें।",
        "Final submission से पहले answers check करें।",
      ];

  if (loading) {
    return (
      <div className="instruction-loading">
        <div className="instruction-spinner"></div>
        <h3>
          {isEnglish
            ? "Loading Test..."
            : "टेस्ट लोड हो रहा है..."}
        </h3>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="instruction-error-page">
        <div className="instruction-error-card">
          <div className="big-error-icon">⚠️</div>

          <h2>
            {isEnglish
              ? "Test Not Available"
              : "टेस्ट उपलब्ध नहीं है"}
          </h2>

          <p>
            {error ||
              (isEnglish
                ? "This test could not be found."
                : "यह टेस्ट नहीं मिला।")}
          </p>

          <button onClick={() => navigate("/tests")}>
            ←{" "}
            {isEnglish
              ? "Back to Tests"
              : "टेस्ट पर वापस जाएँ"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instruction-page">

      {/* ================= HEADER ================= */}

      <header className="instruction-header">

        <div
          className="instruction-brand"
          onClick={() => navigate("/")}
        >
          <div className="brand-box">T</div>

          <div>
            <h2>TestHub</h2>
            <span>Online Examination</span>
          </div>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/tests")}
        >
          ←{" "}
          {isEnglish
            ? "Back to Tests"
            : "टेस्ट पर वापस जाएँ"}
        </button>

      </header>


      {/* ================= MAIN ================= */}

      <main className="instruction-main">

        {/* TOP BAR */}

        <div className="instruction-topbar">

          <div>
            <span className="page-label">
              TEST INSTRUCTIONS
            </span>

            <h1>
              {isEnglish
                ? "Before You Begin"
                : "शुरू करने से पहले"}
            </h1>

            <p>
              {isEnglish
                ? "Please read the instructions carefully before starting your test."
                : "टेस्ट शुरू करने से पहले सभी निर्देश ध्यान से पढ़ें।"}
            </p>
          </div>


          {/* LANGUAGE */}

          <div className="language-box">

            <span>🌐</span>

            <select
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="english">
                English
              </option>

              <option value="hindi">
                हिंदी
              </option>
            </select>

          </div>

        </div>


        {/* ================= TEST INFO ================= */}

        <section className="test-info-grid">

          <div className="test-main-info">

            <div className="test-icon-large">
              📝
            </div>

            <div>
              <span>
                {isEnglish
                  ? "TEST"
                  : "टेस्ट"}
              </span>

              <h2>{test.title}</h2>

              <p>
                {test.description ||
                  (isEnglish
                    ? "Online practice test"
                    : "ऑनलाइन प्रैक्टिस टेस्ट")}
              </p>
            </div>

          </div>


          <div className="info-box">
            <span>❓</span>

            <div>
              <small>
                {isEnglish
                  ? "Questions"
                  : "प्रश्न"}
              </small>

              <strong>
                {test.total_questions || "—"}
              </strong>
            </div>
          </div>


          <div className="info-box">
            <span>⏱️</span>

            <div>
              <small>
                {isEnglish
                  ? "Duration"
                  : "समय"}
              </small>

              <strong>
                {test.duration || "—"} min
              </strong>
            </div>
          </div>


          <div className="info-box">
            <span>🎯</span>

            <div>
              <small>
                {isEnglish
                  ? "Category"
                  : "श्रेणी"}
              </small>

              <strong>
                {test.category || "General"}
              </strong>
            </div>
          </div>

        </section>


        {/* ================= NOTICE ================= */}

        <div className="timer-notice">

          <div className="notice-symbol">
            ⏱
          </div>

          <div>
            <strong>
              {isEnglish
                ? "Important: Timer starts immediately"
                : "महत्वपूर्ण: टाइमर तुरंत शुरू होगा"}
            </strong>

            <p>
              {isEnglish
                ? "The timer will start only after you click the Start Test button."
                : "टाइमर केवल Start Test बटन पर क्लिक करने के बाद शुरू होगा।"}
            </p>
          </div>

        </div>


        {/* ================= CONTENT ================= */}

        <div className="instruction-layout">


          {/* LEFT */}

          <section className="instruction-list-card">

            <div className="section-heading">

              <div className="section-heading-icon">
                📋
              </div>

              <div>
                <h2>
                  {isEnglish
                    ? "Test Instructions"
                    : "टेस्ट निर्देश"}
                </h2>

                <p>
                  {isEnglish
                    ? "Please follow these instructions during the test."
                    : "परीक्षा के दौरान इन निर्देशों का पालन करें।"}
                </p>
              </div>

            </div>


            <div className="instructions-grid">

              {instructions.map((item) => (
                <div
                  className="instruction-row"
                  key={item.number}
                >

                  <div className="number-circle">
                    {item.number}
                  </div>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>

                </div>
              ))}

            </div>

          </section>


          {/* RIGHT */}

          <aside className="before-start-card">

            <div className="side-icon">
              🚀
            </div>

            <h2>
              {isEnglish
                ? "Before You Start"
                : "शुरू करने से पहले"}
            </h2>

            <p>
              {isEnglish
                ? "Make sure everything is ready."
                : "सुनिश्चित करें कि सब कुछ तैयार है।"}
            </p>


            <div className="check-list">

              {beforeStart.map((item, index) => (
                <div
                  className="check-item"
                  key={index}
                >
                  <span>✓</span>

                  <p>{item}</p>
                </div>
              ))}

            </div>


            <div className="side-tip">

              <span>💡</span>

              <p>
                {isEnglish
                  ? "Take your time and answer carefully."
                  : "समय लेकर ध्यान से उत्तर दें।"}
              </p>

            </div>

          </aside>

        </div>


        {/* ================= CONFIRMATION ================= */}

        <section className="confirmation-section">

          <label className="confirm-label">

            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) =>
                setAgreed(e.target.checked)
              }
            />

            <span className="checkbox-design">
              {agreed && "✓"}
            </span>

            <span className="confirm-content">

              <strong>
                {isEnglish
                  ? "I have read and understood all the instructions."
                  : "मैंने सभी निर्देश पढ़ लिए हैं और उन्हें समझ लिया है।"}
              </strong>

              <small>
                {isEnglish
                  ? "I am ready to start the test."
                  : "मैं टेस्ट शुरू करने के लिए तैयार हूँ।"}
              </small>

            </span>

          </label>

        </section>


        {/* ================= START ================= */}

        <div className="start-section">

          <button
            className={`start-button ${
              agreed ? "active" : ""
            }`}
            disabled={!agreed}
            onClick={handleStartTest}
          >

            <span className="start-icon">
              🚀
            </span>

            <span>
              {agreed
                ? isEnglish
                  ? "Start Test"
                  : "टेस्ट शुरू करें"
                : isEnglish
                  ? "Confirm to Start"
                  : "शुरू करने के लिए पुष्टि करें"}
            </span>

            <span className="start-arrow">
              →
            </span>

          </button>

          <p className="start-message">

            {agreed
              ? isEnglish
                ? "You're ready. Good luck! 🎯"
                : "आप तैयार हैं। शुभकामनाएँ! 🎯"
              : isEnglish
                ? "Please check the box above to enable Start Test."
                : "Start Test enable करने के लिए ऊपर checkbox tick करें।"}

          </p>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="instruction-footer">
        © {new Date().getFullYear()} TestHub
        <span> • </span>
        {isEnglish
          ? "Online Examination Platform"
          : "ऑनलाइन परीक्षा प्लेटफॉर्म"}
      </footer>


    </div>
  );
}

export default TestInstructions;