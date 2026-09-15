import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "https://testhub-backend-y450.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();

  /* ================= USER ================= */

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  /* ================= STATS ================= */

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalAttempts: 0,
    averageScore: 0,
  });

  /* ================= RECENT RESULTS ================= */

  const [recentResults, setRecentResults] = useState([]);

  const [loading, setLoading] = useState(true);

  const [resultsLoading, setResultsLoading] = useState(true);

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");

    let currentUser = null;

    try {
      currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      currentUser = null;
    }

    if (!currentUser || currentUser.role !== "admin") {
      alert("Access denied! Admin only.");
      navigate("/");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  /* ================= FETCH ADMIN STATS ================= */

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStats({
            totalUsers: data.stats?.totalUsers || 0,
            totalTests: data.stats?.totalTests || 0,
            totalAttempts: data.stats?.totalAttempts || 0,
            averageScore: data.stats?.averageScore || 0,
          });
        } else {
          console.log(data.message);
        }
      } catch (error) {
        console.log("ADMIN STATS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* ================= FETCH RECENT RESULTS ================= */

  useEffect(() => {
    const fetchRecentResults = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/admin/recent-results`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setRecentResults(data.results || []);
        } else {
          console.log(
            "RECENT RESULTS ERROR:",
            data.message
          );
        }
      } catch (error) {
        console.log(
          "RECENT RESULTS ERROR:",
          error
        );
      } finally {
        setResultsLoading(false);
      }
    };

    fetchRecentResults();
  }, []);

  /* ================= LOGOUT ================= */

  const handleAdminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  /* ================= DASHBOARD ================= */

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
            className="admin-menu-item active"
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

        </nav>

        {/* ================= SIDEBAR BOTTOM ================= */}

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
            onClick={handleAdminLogout}
          >
            ðŸšª Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= HEADER ================= */}

        <header className="admin-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Manage your Online Test platform
            </p>
          </div>

          <div className="admin-profile">

            <div className="admin-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "A"}
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

        </header>


        {/* ================= WELCOME ================= */}

        <section className="admin-welcome">

          <div>

            <h2>
              Welcome back, {user?.name || "Admin"} ðŸ‘‹
            </h2>

            <p>
              Here's what's happening with your test
              platform today.
            </p>

          </div>

          <Link
            to="/admin/tests"
            className="add-test-btn"
          >
            + Create Test
          </Link>

        </section>


        {/* ================= STATS ================= */}

        <section className="admin-stats">

          {/* USERS */}

          <div className="admin-stat-card">

            <div className="stat-icon blue">
              ðŸ‘¥
            </div>

            <div>

              <p>
                Total Users
              </p>

              <h3>
                {loading
                  ? "..."
                  : stats.totalUsers}
              </h3>

              <span className="stat-growth">
                Live Database
              </span>

            </div>

          </div>


          {/* TESTS */}

          <div className="admin-stat-card">

            <div className="stat-icon purple">
              ðŸ“
            </div>

            <div>

              <p>
                Total Tests
              </p>

              <h3>
                {loading
                  ? "..."
                  : stats.totalTests}
              </h3>

              <span className="stat-growth">
                Live Database
              </span>

            </div>

          </div>


          {/* ATTEMPTS */}

          <div className="admin-stat-card">

            <div className="stat-icon green">
              ðŸŽ¯
            </div>

            <div>

              <p>
                Total Attempts
              </p>

              <h3>
                {loading
                  ? "..."
                  : stats.totalAttempts}
              </h3>

              <span className="stat-growth">
                Live Database
              </span>

            </div>

          </div>


          {/* AVERAGE SCORE */}

          <div className="admin-stat-card">

            <div className="stat-icon orange">
              â­
            </div>

            <div>

              <p>
                Average Score
              </p>

              <h3>
                {loading
                  ? "..."
                  : `${stats.averageScore}%`}
              </h3>

              <span className="stat-growth">
                Live Database
              </span>

            </div>

          </div>

        </section>


        {/* ================= CONTENT ================= */}

        <section className="admin-content-grid">


          {/* ================= RECENT RESULTS ================= */}

          <div className="admin-panel results-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Recent Test Results
                </h2>

                <p>
                  Latest test attempts by users
                </p>

              </div>

              <Link to="/admin/results">
                View All
              </Link>

            </div>


            <div className="results-table">

              {/* TABLE HEADER */}

              <div className="table-header">

                <span>
                  User
                </span>

                <span>
                  Test
                </span>

                <span>
                  Score
                </span>

                <span>
                  Status
                </span>

              </div>


              {/* LOADING */}

              {resultsLoading ? (

                <div className="table-row">

                  <span
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Loading recent results...
                  </span>

                </div>

              ) : recentResults.length === 0 ? (

                /* NO RESULTS */

                <div className="table-row">

                  <span
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No test results found
                  </span>

                </div>

              ) : (

                /* REAL RESULTS */

                recentResults.map((result) => (

                  <div
                    className="table-row"
                    key={result.id}
                  >

                    {/* USER */}

                    <div className="user-info">

                      <div className="small-avatar">
                        {result.user_name
                          ? result.user_name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </div>

                      <span>
                        {result.user_name}
                      </span>

                    </div>


                    {/* TEST */}

                    <span>
                      {result.test_title}
                    </span>


                    {/* SCORE */}

                    <strong>
                      {result.percentage}%
                    </strong>


                    {/* STATUS */}

                    <span
                      className={
                        result.status === "Passed"
                          ? "status passed"
                          : "status failed"
                      }
                    >
                      {result.status}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>


          {/* ================= QUICK ACTIONS ================= */}

          <div className="admin-panel quick-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage your platform
                </p>

              </div>

            </div>


            <div className="quick-actions">

              <Link
                to="/admin/tests"
                className="quick-action"
              >

                <div className="quick-icon blue">
                  ðŸ“
                </div>

                <div>

                  <strong>
                    Create Test
                  </strong>

                  <span>
                    Add a new test
                  </span>

                </div>

                <b>
                  â†’
                </b>

              </Link>


              <Link
                to="/admin/questions"
                className="quick-action"
              >

                <div className="quick-icon purple">
                  â“
                </div>

                <div>

                  <strong>
                    Add Questions
                  </strong>

                  <span>
                    Manage questions
                  </span>

                </div>

                <b>
                  â†’
                </b>

              </Link>


              <Link
                to="/admin/users"
                className="quick-action"
              >

                <div className="quick-icon green">
                  ðŸ‘¥
                </div>

                <div>

                  <strong>
                    Manage Users
                  </strong>

                  <span>
                    View all users
                  </span>

                </div>

                <b>
                  â†’
                </b>

              </Link>


              <Link
                to="/admin/results"
                className="quick-action"
              >

                <div className="quick-icon orange">
                  ðŸ“Š
                </div>

                <div>

                  <strong>
                    View Results
                  </strong>

                  <span>
                    Check performance
                  </span>

                </div>

                <b>
                  â†’
                </b>

              </Link>

              <Link
  to="/admin/notifications"
  className="quick-action"
>
  <div className="quick-icon orange">
    ðŸ””
  </div>

  <div>
    <strong>
      Send Notification
    </strong>

    <span>
      Notify students
    </span>
  </div>

  <b>
    â†’
  </b>
</Link>

            </div>

          </div>

        </section>


        {/* ================= BOTTOM CARDS ================= */}

        <section className="admin-bottom-grid">


          {/* USERS */}

          <div className="admin-info-card">

            <div className="info-card-icon">
              ðŸ‘¥
            </div>

            <div>

              <h3>
                {loading
                  ? "..."
                  : `${stats.totalUsers} Users`}
              </h3>

              <p>
                Registered on the platform
              </p>

            </div>

            <Link to="/admin/users">
              Manage â†’
            </Link>

          </div>


          {/* TESTS */}

          <div className="admin-info-card">

            <div className="info-card-icon">
              ðŸ“
            </div>

            <div>

              <h3>
                {loading
                  ? "..."
                  : `${stats.totalTests} Tests`}
              </h3>

              <p>
                Available for students
              </p>

            </div>

            <Link to="/admin/tests">
              Manage â†’
            </Link>

          </div>


          {/* QUESTIONS */}

          <div className="admin-info-card">

            <div className="info-card-icon">
              â“
            </div>

            <div>

              <h3>
                Questions
              </h3>

              <p>
                Across all tests
              </p>

            </div>

            <Link to="/admin/questions">
              Manage â†’
            </Link>

          </div>


        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;

