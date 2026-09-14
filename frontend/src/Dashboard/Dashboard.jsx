import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Dashboard.css";

const API = "${import.meta.env.VITE_API_URL}";

const Dashboard = () => {
  const navigate = useNavigate();

  /* =====================================================
     STATES
  ===================================================== */

  const [stats, setStats] = useState({
    testsTaken: 0,
    completed: 0,
    averageScore: 0,
    bestScore: 0,
  });

  const [results, setResults] = useState([]);

  const [tests, setTests] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);

  const [certificateStatuses, setCertificateStatuses] =
    useState({});

  const [loading, setLoading] = useState(true);

const [user, setUser] = useState({
  name: "Student",
  email: "student@example.com",
  profile_photo: null,
});

  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  /* =====================================================
     USER
  ===================================================== */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        const parsed =
          JSON.parse(savedUser);

        setUser({
          name:
            parsed.name ||
            parsed.username ||
            "Student",

          email:
            parsed.email ||
            "student@example.com",

            profile_photo:
            parsed.profile_photo || null,
        });
      }
    } catch (error) {
      console.log(
        "User data error:",
        error
      );
    }
  }, []);

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      ""
    );
  };

  /* =====================================================
   NOTIFICATIONS
===================================================== */

useEffect(() => {
  fetchNotifications();
}, []);

const fetchNotifications = async () => {
  try {
    const token = getToken();

    if (!token) return;

    const response = await fetch(
      `${API}/api/notifications`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Notification API Error:", data);
      return;
    }

    setNotifications(data.notifications || []);
  } catch (error) {
    console.error("Fetch notifications error:", error);
  }
};

  /* =====================================================
     FETCH DASHBOARD
  ===================================================== */

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const [
        statsRes,
        resultsRes,
        testsRes,
        leaderboardRes,
      ] = await Promise.all([
        fetch(
          `${API}/api/dashboard/stats`,
          { headers }
        ),

        fetch(
          `${API}/api/dashboard/results`,
          { headers }
        ),

        fetch(
          `${API}/api/tests`,
          { headers }
        ),

        fetch(
          `${API}/api/leaderboard`,
          { headers }
        ),
      ]);

      /* ================= STATS ================= */

      if (statsRes.ok) {
        const data =
          await statsRes.json();

        setStats(
          data.stats || {
            testsTaken: 0,
            completed: 0,
            averageScore: 0,
            bestScore: 0,
          }
        );
      }

      /* ================= RESULTS ================= */

      if (resultsRes.ok) {
        const data =
          await resultsRes.json();

        const dashboardResults =
          Array.isArray(data)
            ? data
            : data.results || [];

        setResults(
          dashboardResults
        );

        fetchCertificateStatuses(
          dashboardResults,
          token
        );
      }

      /* ================= TESTS ================= */

      if (testsRes.ok) {
        const data =
          await testsRes.json();

        let testList = [];

        if (Array.isArray(data)) {
          testList = data;
        } else {
          testList =
            data.tests ||
            data.data ||
            [];
        }

        setTests(testList);
      }

      /* ================= LEADERBOARD ================= */

      if (leaderboardRes.ok) {
        const data =
          await leaderboardRes.json();

        setLeaderboard(
          data.leaderboard || []
        );
      }
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CERTIFICATE STATUS
  ===================================================== */

  const fetchCertificateStatuses = async (
    resultList,
    token
  ) => {
    const eligibleResults =
      resultList.filter(
        (result) =>
          Number(result.percentage) >= 60
      );

    if (!eligibleResults.length) {
      return;
    }

    const headers = {};

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const statusMap = {};

    await Promise.all(
      eligibleResults.map(
        async (result) => {
          try {
            const response =
              await fetch(
                `${API}/api/certificates/${result.id}`,
                { headers }
              );

            const data =
              await response.json();

            if (response.ok) {
              statusMap[result.id] = {
                status:
                  data.certificate
                    ?.status ||
                  data.status ||
                  "Approved",

                certificate:
                  data.certificate ||
                  data,
              };
            } else {
              statusMap[result.id] = {
                status:
                  data.status ||
                  "Pending",
              };
            }
          } catch (error) {
            statusMap[result.id] = {
              status: "Pending",
            };
          }
        }
      )
    );

    setCertificateStatuses(
      statusMap
    );
  };

/* =====================================================
   HELPERS
===================================================== */

const getInitial = () => {
  return user.name
    ? user.name.charAt(0).toUpperCase()
    : "T";
};

const getProfilePhoto = () => {
  if (!user.profile_photo) {
    return "";
  }

  if (
    user.profile_photo.startsWith("http://") ||
    user.profile_photo.startsWith("https://")
  ) {
    return user.profile_photo;
  }

  return `${API}${user.profile_photo}`;
};

const getResultClass = (percentage) => {
  return Number(percentage) >= 50
    ? "passed"
    : "failed";
};

  const getCertificateInfo = (
    result
  ) => {
    if (
      Number(result.percentage) < 60
    ) {
      return {
        type: "not-eligible",
        label: "🔒 Not Eligible",
      };
    }

    const certificate =
      certificateStatuses[
        result.id
      ];

    if (!certificate) {
      return {
        type: "pending",
        label: "⏳ Pending",
      };
    }

    if (
      certificate.status ===
      "Approved"
    ) {
      return {
        type: "approved",
        label:
          "🏆 View Certificate",
      };
    }

    if (
      certificate.status ===
      "Rejected"
    ) {
      return {
        type: "rejected",
        label: "✕ Rejected",
      };
    }

    return {
      type: "pending",
      label: "⏳ Pending",
    };
  };

  const getTimeText = (
    seconds
  ) => {
    if (
      seconds === null ||
      seconds === undefined ||
      seconds === ""
    ) {
      return "—";
    }

    const totalSeconds =
      Number(seconds);

    if (
      Number.isNaN(totalSeconds)
    ) {
      return "—";
    }

    const mins =
      Math.floor(
        totalSeconds / 60
      );

    if (mins < 1) {
      return `${totalSeconds}s`;
    }

    return `${mins} min`;
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (e) => {
    e.preventDefault();

    const value =
      searchText.trim();

    if (!value) {
      navigate("/tests");
      return;
    }

    navigate(
      `/tests?search=${encodeURIComponent(
        value
      )}`
    );
  };

  /* =====================================================
     RECOMMENDED TESTS
  ===================================================== */

  const recommendedTests =
    useMemo(() => {
      const attemptedIds =
        results.map(
          (item) =>
            Number(item.test_id)
        );

      const available =
        tests.filter(
          (test) =>
            !attemptedIds.includes(
              Number(test.id)
            )
        );

      return available.slice(
        0,
        4
      );
    }, [tests, results]);

  /* =====================================================
     PERFORMANCE
  ===================================================== */

  const performanceData =
    useMemo(() => {
      const lastResults =
        [...results]
          .reverse()
          .slice(-8);

      if (!lastResults.length) {
        return [
          {
            label: "Jan",
            value: 0,
          },
          {
            label: "Feb",
            value: 0,
          },
          {
            label: "Mar",
            value: 0,
          },
          {
            label: "Apr",
            value: 0,
          },
          {
            label: "May",
            value: 0,
          },
          {
            label: "Jun",
            value: 0,
          },
          {
            label: "Jul",
            value: 0,
          },
          {
            label: "Aug",
            value: 0,
          },
        ];
      }

      return lastResults.map(
        (item, index) => ({
          label:
            item.submitted_at
              ? new Date(
                  item.submitted_at
                ).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                  }
                )
              : `Test ${
                  index + 1
                }`,

          value:
            Number(
              item.percentage
            ) || 0,
        })
      );
    }, [results]);

  const chartPoints =
    performanceData.map(
      (item, index) => {
        const x =
          performanceData.length === 1
            ? 50
            : (index /
                (performanceData.length -
                  1)) *
              100;

        const y =
          100 - item.value;

        return {
          ...item,
          x,
          y,
        };
      }
    );

  const chartPath =
    chartPoints
      .map(
        (point, index) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${point.x} ${point.y}`
      )
      .join(" ");

  /* =====================================================
     STREAK
  ===================================================== */

  const streakDays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const currentStreak =
    results.length
      ? Math.min(
          results.length + 1,
          7
        )
      : 0;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-loader-page">

        <div className="dashboard-loader"></div>

        <p>
          Loading your dashboard...
        </p>

      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="student-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

  {/* BRAND */}
  <Link
    to="/dashboard"
    className="dashboard-brand"
  >
    <div className="brand-icon">
      🎓
    </div>

    <div className="brand-text">
      <div className="brand-title">
        TestHub
      </div>

      <div className="brand-tagline">
        LEARN • PRACTICE • GROW
      </div>
    </div>
  </Link>


  {/* DESKTOP NAVIGATION */}
  <nav
    className={`dashboard-nav ${
      menuOpen ? "mobile-open" : ""
    }`}
  >

    <Link
      to="/"
      className="nav-link"
      onClick={() => setMenuOpen(false)}
    >
      Home
    </Link>

    <Link
      to="/tests"
      className="nav-link"
      onClick={() => setMenuOpen(false)}
    >
      Tests
    </Link>

    <Link
      to="/results"
      className="nav-link"
      onClick={() => setMenuOpen(false)}
    >
      Results
    </Link>

    <Link
      to="/certificates"
      className="nav-link"
      onClick={() => setMenuOpen(false)}
    >
      Certificates
    </Link>

    <Link
      to="/leaderboard"
      className="nav-link"
      onClick={() => setMenuOpen(false)}
    >
      Leaderboard
    </Link>

    <Link
      to="/dashboard"
      className="nav-link active"
      onClick={() => setMenuOpen(false)}
    >
      Dashboard
    </Link>

  </nav>


  {/* RIGHT SIDE */}
  <div className="header-right">

    {/* SEARCH */}
    <form
      className="dashboard-search"
      onSubmit={handleSearch}
    >

      <span className="search-icon">
        🔍
      </span>

      <input
        type="text"
        value={searchText}
        onChange={(e) =>
          setSearchText(e.target.value)
        }
        placeholder="Search tests..."
      />

      <button
        type="submit"
        className="search-submit"
      >
        Search
      </button>

    </form>


    {/* NOTIFICATION */}
    <div className="notification-wrapper">

      <button
        type="button"
        className="notification-btn"
        onClick={() =>
          setShowNotifications((prev) => !prev)
        }
      >
        🔔

        {notifications.filter(
          (notification) => !notification.is_read
        ).length > 0 && (
          <span className="notification-count">
            {
              notifications.filter(
                (notification) =>
                  !notification.is_read
              ).length
            }
          </span>
        )}

      </button>


      {/* NOTIFICATION DROPDOWN */}
      {showNotifications && (
        <div className="notification-dropdown">

          <div className="notification-header">

            <div>
              <h3>
                Notifications
              </h3>

              <span>
                {
                  notifications.filter(
                    (notification) =>
                      !notification.is_read
                  ).length
                }{" "}
                unread
              </span>
            </div>


            <button
              type="button"
              onClick={async () => {
                try {
                  const token = getToken();

                  await fetch(
                    `${API}/api/notifications/read-all`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type":
                          "application/json",
                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  );

                  setNotifications((prev) =>
                    prev.map((notification) => ({
                      ...notification,
                      is_read: true,
                    }))
                  );

                } catch (error) {
                  console.error(
                    "Mark all read error:",
                    error
                  );
                }
              }}
            >
              Mark all as read
            </button>

          </div>


          <div className="notification-list">

            {notifications.length === 0 ? (

              <div className="notification-empty">

                <div>🔔</div>

                <strong>
                  No notifications
                </strong>

                <span>
                  You're all caught up!
                </span>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`}
                  >

                    <div
                      className={`notification-icon ${
                        notification.type
                      }`}
                    >
                      {notification.type === "test"
                        ? "📚"
                        : notification.type === "success"
                        ? "🎉"
                        : notification.type === "certificate"
                        ? "🏆"
                        : notification.type === "announcement"
                        ? "📢"
                        : "🔔"}
                    </div>


                    <div className="notification-content">

                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                      <span>
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>

                    </div>


                    {!notification.is_read && (
                      <span className="unread-dot"></span>
                    )}

                  </div>

                )
              )

            )}

          </div>

        </div>
      )}

    </div>


    {/* USER */}
    <Link
      to="/account"
      className="header-user"
    >

      <div className="header-avatar">

        {getProfilePhoto() ? (

          <img
            src={getProfilePhoto()}
            alt="Profile"
          />

        ) : (

          getInitial()

        )}

      </div>

      <strong>
        {user.name}
      </strong>

      <span className="dropdown-arrow">
        ▾
      </span>

    </Link>


    {/* MOBILE HAMBURGER */}
    <button
      type="button"
      className={`dashboard-hamburger ${
        menuOpen ? "open" : ""
      }`}
      onClick={() =>
        setMenuOpen((prev) => !prev)
      }
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
    >

      <span></span>
      <span></span>
      <span></span>

    </button>

  </div>

</header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-container">

        <div className="dashboard-grid">


          {/* =================================================
              LEFT
          ================================================= */}

          <section className="dashboard-main">


            {/* HERO */}

            <div className="welcome-card">

              <div className="welcome-content">

                <div className="welcome-small">
                  Welcome Back,
                </div>

                <h1>
                  {user.name} 👋
                </h1>

                <p>
                  Keep learning,
                  keep growing.
                  Your future is
                  built by what
                  you do today.
                </p>

                <div className="hero-buttons">

                  <Link
                    to="/tests"
                    className="primary-btn"
                  >
                    📖 Explore Tests →
                  </Link>

                  <Link
                    to="/ai-doubt"
                    className="secondary-btn"
                  >
                    🤖 AI Doubt Solver
                  </Link>

                </div>

              </div>


              <div className="hero-illustration">
  <img
    src="/boy-dashboard.png"
    alt="Student learning online"
    className="student-dashboard-image"
  />
</div>
</div>

            {/* =================================================
                STATS
            ================================================= */}

            <div className="stats-grid">


              <div className="stat-card">

                <div className="stat-icon blue">
                  📋
                </div>

                <div className="stat-info">

                  <span>
                    Tests Taken
                  </span>

                  <strong>
                    {stats.testsTaken || 0}
                  </strong>

                  <small>
                    Total attempts
                  </small>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon green">
                  ✓
                </div>

                <div className="stat-info">

                  <span>
                    Completed
                  </span>

                  <strong>
                    {stats.completed || 0}
                  </strong>

                  <small>
                    Tests completed
                  </small>

                </div>

                <div className="progress-ring">

                  <svg viewBox="0 0 42 42">

                    <circle
                      cx="21"
                      cy="21"
                      r="15"
                      className="ring-bg"
                    />

                    <circle
                      cx="21"
                      cy="21"
                      r="15"
                      className="ring-value"
                      style={{
                        strokeDasharray: `${
                          Math.min(
                            Number(
                              stats.averageScore
                            ) || 0,
                            100
                          ) *
                          0.942
                        } 94.2`,
                      }}
                    />

                  </svg>

                  <span>
                    {Math.round(
                      Number(
                        stats.averageScore
                      ) || 0
                    )}
                    %
                  </span>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon purple">
                  📊
                </div>

                <div className="stat-info">

                  <span>
                    Average Score
                  </span>

                  <strong>
                    {Number(
                      stats.averageScore ||
                        0
                    ).toFixed(1)}
                    %
                  </strong>

                  <small>
                    Overall performance
                  </small>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon orange">
                  🏆
                </div>

                <div className="stat-info">

                  <span>
                    Best Score
                  </span>

                  <strong>
                    {Number(
                      stats.bestScore || 0
                    ).toFixed(0)}
                    %
                  </strong>

                  <small>
                    Your highest score
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                MIDDLE
            ================================================= */}

            <div className="middle-grid">


              {/* PERFORMANCE */}

              <div className="panel performance-panel">

                <div className="panel-header">

                  <div>

                    <h2>
                      📈 Your Performance
                    </h2>

                    <p>
                      Track your progress
                      over time
                    </p>

                  </div>

                  <select defaultValue="9">

                    <option value="9">
                      Last 9 Months
                    </option>

                    <option value="6">
                      Last 6 Months
                    </option>

                    <option value="3">
                      Last 3 Months
                    </option>

                  </select>

                </div>


                <div className="chart">

                  <div className="chart-y-axis">

                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>

                  </div>


                  <div className="chart-area">

                    <div className="grid-line one"></div>
                    <div className="grid-line two"></div>
                    <div className="grid-line three"></div>
                    <div className="grid-line four"></div>


                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="performance-svg"
                    >

                      <defs>

                        <linearGradient
                          id="chartFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopOpacity="0.25"
                          />

                          <stop
                            offset="100%"
                            stopOpacity="0"
                          />

                        </linearGradient>

                      </defs>


                      <path
                        d={`${chartPath} L 100 100 L 0 100 Z`}
                        className="chart-fill"
                      />

                      <path
                        d={chartPath}
                        className="chart-line"
                      />


                      {chartPoints.map(
                        (
                          point,
                          index
                        ) => (

                          <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="1.4"
                            className="chart-dot"
                          />

                        )
                      )}

                    </svg>


                    <div className="chart-labels">

                      {performanceData.map(
                        (
                          item,
                          index
                        ) => (

                          <span
                            key={index}
                          >
                            {item.label}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* QUICK ACTIONS */}

              <div className="panel quick-panel">

                <div className="panel-header">

                  <div>

                    <h2>
                      ⚡ Quick Actions
                    </h2>

                    <p>
                      Everything you need,
                      in one place
                    </p>

                  </div>

                </div>


                <div className="quick-grid">


                  <Link
                    to="/tests"
                    className="quick-item"
                  >

                    <div className="quick-icon blue">
                      📖
                    </div>

                    <div>

                      <strong>
                        Browse Tests
                      </strong>

                      <span>
                        Explore all
                        available tests
                      </span>

                    </div>

                    <b>→</b>

                  </Link>


                  <Link
                    to="/results"
                    className="quick-item"
                  >

                    <div className="quick-icon purple">
                      📊
                    </div>

                    <div>

                      <strong>
                        My Results
                      </strong>

                      <span>
                        View your test
                        history
                      </span>

                    </div>

                    <b>→</b>

                  </Link>


                  <Link
                    to="/certificates"
                    className="quick-item"
                  >

                    <div className="quick-icon orange">
                      🏆
                    </div>

                    <div>

                      <strong>
                        My Certificates
                      </strong>

                      <span>
                        View earned
                        certificates
                      </span>

                    </div>

                    <b>→</b>

                  </Link>


                  <Link
                    to="/ai-doubt"
                    className="quick-item"
                  >

                    <div className="quick-icon cyan">
                      🤖
                    </div>

                    <div>

                      <strong>
                        AI Doubt Solver
                      </strong>

                      <span>
                        Get instant help
                      </span>

                    </div>

                    <b>→</b>

                  </Link>

                </div>

              </div>

            </div>


            {/* =================================================
                RECENT RESULTS
            ================================================= */}

            <div className="panel results-panel">

              <div className="panel-header results-header">

                <div>

                  <h2>
                    📋 Recent Test Results
                  </h2>

                  <p>
                    Your latest test attempts
                  </p>

                </div>

                <Link to="/results">
                  View All Results →
                </Link>

              </div>


              <div className="results-table-wrapper">

                <table className="results-table">

                  <thead>

                    <tr>

                      <th>
                        Test Title
                      </th>

                      <th>
                        Score
                      </th>

                      <th>
                        Percentage
                      </th>

                      <th>
                        Time Taken
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Result
                      </th>

                      <th>
                        Certificate
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {results.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="empty-results"
                        >

                          <div>
                            📝
                          </div>

                          <strong>
                            No tests attempted yet
                          </strong>

                          <span>
                            Start your first
                            test to see
                            results here.
                          </span>

                          <Link to="/tests">
                            Explore Tests →
                          </Link>

                        </td>

                      </tr>

                    ) : (

                      results
                        .slice(0, 5)
                        .map(
                          (result) => {

                            const cert =
                              getCertificateInfo(
                                result
                              );

                            return (

                              <tr
                                key={result.id}
                              >

                                <td>

                                  <strong>
                                    {
                                      result.test_title ||
                                      result.title ||
                                      "Test"
                                    }
                                  </strong>

                                </td>


                                <td>

                                  <strong>
                                    {
                                      result.score ??
                                      0
                                    }
                                    /
                                    {
                                      result.total_questions ??
                                      0
                                    }
                                  </strong>

                                </td>


                                <td>

                                  <strong>
                                    {Number(
                                      result.percentage ||
                                        0
                                    ).toFixed(0)}
                                    %
                                  </strong>

                                </td>


                                <td>
                                  {getTimeText(
                                    result.time_taken
                                  )}
                                </td>


                                <td>

                                  {result.submitted_at
                                    ? new Date(
                                        result.submitted_at
                                      ).toLocaleDateString(
                                        "en-GB",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )
                                    : "—"}

                                </td>


                                <td>

                                  <span
                                    className={`result-badge ${getResultClass(
                                      result.percentage
                                    )}`}
                                  >

                                    {Number(
                                      result.percentage
                                    ) >= 50
                                      ? "● Passed"
                                      : "● Failed"}

                                  </span>

                                </td>


                                <td>

                                  {cert.type ===
                                  "approved" ? (

                                    <Link
                                      to={`/certificate/${result.id}`}
                                      className="certificate-btn"
                                    >
                                      🏆 View Certificate
                                    </Link>

                                  ) : (

                                    <span
                                      className={`certificate-status ${cert.type}`}
                                    >
                                      {cert.label}
                                    </span>

                                  )}

                                </td>

                              </tr>

                            );
                          }
                        )

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =================================================
                CONTINUE LEARNING
            ================================================= */}

            <div className="panel learning-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    🎯 Continue Your Learning 🚀
                  </h2>

                  <p>
                    Based on your interests
                    and performance
                  </p>

                </div>

                <Link to="/tests">
                  View All Tests →
                </Link>

              </div>


              <div className="learning-grid">

                {recommendedTests.length ===
                0 ? (

                  <div className="no-recommendations">

                    <span>
                      🎉
                    </span>

                    <strong>
                      Great job! You have
                      explored all available
                      tests.
                    </strong>

                    <Link to="/tests">
                      Browse All Tests →
                    </Link>

                  </div>

                ) : (

                  recommendedTests.map(
                    (
                      test,
                      index
                    ) => (

                      <div
                        className="learning-card"
                        key={
                          test.id ||
                          index
                        }
                      >

                        <div className="learning-icon">

                          {index === 0
                            ? "🟢"
                            : index === 1
                            ? "🌿"
                            : index === 2
                            ? "🔗"
                            : "🧮"}

                        </div>


                        <div className="learning-info">

                          <h3>
                            {test.title ||
                              test.name ||
                              "Practice Test"}
                          </h3>


                          <div className="learning-meta">

                            <span>
                              {
                                test.total_questions ||
                                test.questions_count ||
                                20
                              }{" "}
                              Questions
                            </span>

                            <i>
                              •
                            </i>

                            <span>
                              {
                                test.duration ||
                                30
                              }{" "}
                              Minutes
                            </span>

                          </div>


                          <p>
                            Strengthen your
                            knowledge and
                            improve your
                            performance.
                          </p>


                          <Link
                            to={`/test/${test.id}`}
                            className="start-test-btn"
                          >
                            Start Test →
                          </Link>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="dashboard-sidebar">


            {/* PROFILE */}

            <div className="side-card profile-card">

              <div className="profile-top">

                <div className="large-avatar">
  {getProfilePhoto() ? (
    <img
      src={getProfilePhoto()}
      alt="Profile"
    />
  ) : (
    getInitial()
  )}
</div>

                <div>

                  <h3>
                    {user.name}
                  </h3>

                  <span>
                    Student
                  </span>

                </div>

              </div>


              <Link
                to="/account"
                className="edit-profile-btn"
              >
                Edit Profile
              </Link>


              <div className="profile-details">

                <div>
                  ✉️

                  <span>
                    {user.email}
                  </span>
                </div>


                <div>
                  ◉

                  <span>
                    Member
                  </span>
                </div>


                <div className="active-status">
                  ● Active Learner
                </div>

              </div>


              <div className="quote-box">

                <strong>
                  “Discipline today
                  <br />
                  leads to success
                  tomorrow.”
                </strong>

                <span>
                  🎯 Keep Going!
                </span>

              </div>

            </div>


            {/* STREAK */}

            <div className="side-card streak-card">

              <div className="streak-heading">

                <span className="fire">
                  🔥
                </span>

                <div>

                  <h3>
                    Current Streak
                  </h3>

                  <strong>
                    {currentStreak} Days
                  </strong>

                  <p>
                    Great job! Keep
                    practicing every day.
                  </p>

                </div>

              </div>


              <div className="streak-days">

                {streakDays.map(
                  (
                    day,
                    index
                  ) => (

                    <div
                      key={day}
                      className="streak-day"
                    >

                      <div
                        className={
                          index <
                          currentStreak
                            ? "day-check active"
                            : "day-check"
                        }
                      >
                        {index <
                        currentStreak
                          ? "✓"
                          : ""}
                      </div>

                      <span>
                        {day}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* LEADERBOARD */}

            <div className="side-card leaderboard-card">

              <div className="side-title">

                <h3>
                  🏆 Top Performers
                </h3>

                <Link to="/leaderboard">
                  View All
                </Link>

              </div>


              <div className="leaderboard-list">

                {leaderboard.length ===
                0 ? (

                  <div className="leader-empty">
                    No leaderboard data yet.
                  </div>

                ) : (

                  leaderboard
                    .slice(0, 5)
                    .map(
                      (
                        person,
                        index
                      ) => (

                        <div
                          className={`leader-item ${
                            index === 0
                              ? "first"
                              : ""
                          }`}
                          key={
                            person.id ||
                            index
                          }
                        >

                          <div className="rank">
                            {index + 1}
                          </div>

                          <div className="leader-avatar">

                            {person.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "S"}

                          </div>

                          <div className="leader-name">

                            {person.name ||
                              "Student"}

                          </div>

                          <strong>

                            {Number(
                              person.bestScore ||
                                0
                            ).toFixed(0)}
                            %

                          </strong>

                        </div>

                      )
                    )

                )}

              </div>

            </div>


            {/* MOTIVATION */}

            <div className="side-card motivation-card">

              <div className="quote-mark">
                “
              </div>

              <p>
                The expert in anything
                <br />
                was once a beginner.
              </p>

              <span>
                — Helen Hayes
              </span>

            </div>

          </aside>

        </div>

      </main>


      {/* =================================================
          FLOATING AI
      ================================================= */}

      <Link
        to="/ai-doubt"
        className="floating-ai"
        title="AI Doubt Solver"
      >
        🤖
      </Link>

    </div>
  );
};

export default Dashboard;
