import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../AdminDashboard.css";

const API_URL = "${import.meta.env.VITE_API_URL}";

function AdminUsers() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (!storedUser || storedUser.role !== "admin") {
        alert("Access denied! Admin only.");
        navigate("/");
        return;
      }

      setUser(storedUser);
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  }, [navigate]);

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch users"
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.log("USERS ERROR:", error);

      setMessage(
        error.message || "Failed to load users"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ================= FORM ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ================= OPEN ADD ================= */

  const openAddModal = () => {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

    setMessage("");
    setMessageType("");

    setShowModal(true);
  };

  /* ================= OPEN EDIT ================= */

  const openEditModal = (item) => {
    setEditingUser(item);

    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "student",
    });

    setMessage("");
    setMessageType("");

    setShowModal(true);
  };

  /* ================= CLOSE MODAL ================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

    setMessage("");
    setMessageType("");
  };

  /* ================= SAVE USER ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!form.name.trim()) {
      setMessage("Please enter user name.");
      setMessageType("error");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Please enter email.");
      setMessageType("error");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setMessage("Please enter password.");
      setMessageType("error");
      return;
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      setMessage(
        "Password must be at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const url = editingUser
        ? `${API_URL}/api/admin/users/${editingUser.id}`
        : `${API_URL}/api/admin/users`;

      const method = editingUser ? "PUT" : "POST";

      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };

      if (form.password.trim()) {
        body.password = form.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save user"
        );
      }

      setMessage(
        editingUser
          ? "User updated successfully."
          : "User created successfully."
      );

      setMessageType("success");

      await fetchUsers();

      setTimeout(() => {
        setShowModal(false);
        setEditingUser(null);

        setForm({
          name: "",
          email: "",
          password: "",
          role: "student",
        });

        setMessage("");
        setMessageType("");
      }, 700);
    } catch (error) {
      console.log("SAVE USER ERROR:", error);

      setMessage(
        error.message || "Failed to save user"
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE USER ================= */

  const handleDelete = async (item) => {
    if (user && Number(user.id) === Number(item.id)) {
      alert("You cannot delete your own admin account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name}?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/users/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user"
        );
      }

      setMessage("User deleted successfully.");
      setMessageType("success");

      await fetchUsers();

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    } catch (error) {
      console.log("DELETE USER ERROR:", error);

      setMessage(
        error.message || "Failed to delete user"
      );
      setMessageType("error");
    }
  };

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

          <Link
            to="/admin"
            className="admin-menu-item"
          >
            <span>📊</span>
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="admin-menu-item active"
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
            className="admin-menu-item"
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
            <h1>Users</h1>

            <p>
              Manage registered users
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
              All Users 👥
            </h2>

            <p>
              View and manage all registered users.
            </p>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="button"
              className="refresh-btn"
              onClick={fetchUsers}
              disabled={loading}
            >
              🔄 Refresh
            </button>

            <button
              type="button"
              className="add-test-btn"
              onClick={openAddModal}
            >
              + Add User
            </button>

          </div>

        </section>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 18px",
              borderRadius: "10px",
              background:
                messageType === "success"
                  ? "#eaf8ef"
                  : "#fff0f0",
              color:
                messageType === "success"
                  ? "#198754"
                  : "#d93636",
              fontWeight: "600",
              border:
                messageType === "success"
                  ? "1px solid #b9e7c8"
                  : "1px solid #ffc7c7",
            }}
          >
            {message}
          </div>
        )}

        {/* ================= USERS PANEL ================= */}

        <section className="admin-panel">

          <div className="panel-header">

            <div>

              <h2>
                Registered Users
              </h2>

              <p>
                Total users: {users.length}
              </p>

            </div>

          </div>

          {/* ================= TABLE ================= */}

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "950px",
              }}
            >

              <thead>

                <tr>

                  <th style={thStyle}>
                    #
                  </th>

                  <th style={thStyle}>
                    User
                  </th>

                  <th style={thStyle}>
                    Email
                  </th>

                  <th style={thStyle}>
                    Role
                  </th>

                  <th style={thStyle}>
                    Tests Attempted
                  </th>

                  <th style={thStyle}>
                    Registered
                  </th>

                  <th style={thStyle}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={emptyStyle}
                    >
                      Loading users...
                    </td>

                  </tr>

                ) : users.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={emptyStyle}
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  users.map((item, index) => (

                    <tr key={item.id}>

                      {/* NUMBER */}

                      <td style={tdStyle}>
                        {index + 1}
                      </td>

                      {/* USER */}

                      <td style={tdStyle}>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >

                          <div className="small-avatar">
                            {item.name
                              ? item.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}
                          </div>

                          <strong>
                            {item.name}
                          </strong>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td style={tdStyle}>
                        {item.email}
                      </td>

                      {/* ROLE */}

                      <td style={tdStyle}>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              item.role === "admin"
                                ? "#fff0f0"
                                : "#eef6ff",
                            color:
                              item.role === "admin"
                                ? "#d93636"
                                : "#2672d9",
                          }}
                        >
                          {item.role === "admin"
                            ? "Admin"
                            : "Student"}
                        </span>

                      </td>

                      {/* TESTS */}

                      <td style={tdStyle}>
                        {item.tests_attempted ?? 0}
                      </td>

                      {/* DATE */}

                      <td style={tdStyle}>

                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}

                      </td>

                      {/* ACTIONS */}

                      <td style={tdStyle}>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(item)
                            }
                            style={{
                              border: "1px solid #dbe7f5",
                              background: "#eef6ff",
                              color: "#2672d9",
                              padding: "7px 12px",
                              borderRadius: "7px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item)
                            }
                            disabled={
                              user &&
                              Number(user.id) ===
                                Number(item.id)
                            }
                            style={{
                              border: "1px solid #ffd0d0",
                              background:
                                user &&
                                Number(user.id) ===
                                  Number(item.id)
                                  ? "#f5f5f5"
                                  : "#fff0f0",
                              color:
                                user &&
                                Number(user.id) ===
                                  Number(item.id)
                                  ? "#999"
                                  : "#d93636",
                              padding: "7px 12px",
                              borderRadius: "7px",
                              cursor:
                                user &&
                                Number(user.id) ===
                                  Number(item.id)
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "600",
                            }}
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* ================= ADD / EDIT MODAL ================= */}

      {showModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  {editingUser
                    ? "Edit User"
                    : "Add New User"}
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#777",
                  }}
                >
                  {editingUser
                    ? "Update user information"
                    : "Create a new student or admin"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  border: "none",
                  background: "#f2f4f7",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* NAME */}

              <div style={formGroupStyle}>

                <label style={labelStyle}>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={inputStyle}
                  disabled={saving}
                />

              </div>

              {/* EMAIL */}

              <div style={formGroupStyle}>

                <label style={labelStyle}>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={inputStyle}
                  disabled={saving}
                />

              </div>

              {/* PASSWORD */}

              <div style={formGroupStyle}>

                <label style={labelStyle}>
                  Password
                  {editingUser && (
                    <span
                      style={{
                        fontWeight: "400",
                        color: "#888",
                        marginLeft: "6px",
                      }}
                    >
                      (leave empty to keep current)
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "New password"
                      : "Enter password"
                  }
                  style={inputStyle}
                  disabled={saving}
                />

              </div>

              {/* ROLE */}

              <div style={formGroupStyle}>

                <label style={labelStyle}>
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={saving}
                >

                  <option value="student">
                    👨‍🎓 Student
                  </option>

                  <option value="admin">
                    👨‍💼 Admin
                  </option>

                </select>

              </div>

              {/* ERROR / SUCCESS */}

              {message && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    background:
                      messageType === "success"
                        ? "#eaf8ef"
                        : "#fff0f0",
                    color:
                      messageType === "success"
                        ? "#198754"
                        : "#d93636",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {message}
                </div>
              )}

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    padding: "11px 18px",
                    borderRadius: "8px",
                    border:
                      "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "11px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#1677e8",
                    color: "#fff",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* ================= STYLES ================= */

const thStyle = {
  textAlign: "left",
  padding: "15px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #f0f0f0",
};

const emptyStyle = {
  textAlign: "center",
  padding: "40px",
};

const formGroupStyle = {
  marginBottom: "17px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  fontSize: "14px",
  color: "#172033",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1px solid #d9e0e8",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
};

export default AdminUsers;
