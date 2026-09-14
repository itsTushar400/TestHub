import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import "../AdminDashboard.css";
const API_URL = "${import.meta.env.VITE_API_URL}";

function AdminTests() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
     ===================================================== */

  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingTest, setEditingTest] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    duration: 10,
    description: "",
  });


  /* =====================================================
     ADMIN CHECK
     ===================================================== */

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (
      !token ||
      !user ||
      user.role !== "admin"
    ) {
      navigate("/login");
      return;
    }

    loadTests();
    loadCategories();
  }, [navigate]);


  /* =====================================================
     LOAD TESTS
     ===================================================== */

  const loadTests = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/tests`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to load tests"
        );
        return;
      }

      setTests(
        Array.isArray(data.tests)
          ? data.tests
          : []
      );

    } catch (error) {
      console.error(
        "LOAD TESTS ERROR:",
        error
      );

      alert(
        "Server error while loading tests"
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     LOAD CATEGORIES
     ===================================================== */

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "CATEGORY ERROR:",
          data
        );
        return;
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );

    } catch (error) {
      console.error(
        "CATEGORY ERROR:",
        error
      );
    }
  };


  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     RESET FORM
     ===================================================== */

  const resetForm = () => {
    setForm({
      title: "",
      category_id: "",
      duration: 10,
      description: "",
    });
  };


  /* =====================================================
     CREATE MODAL
     ===================================================== */

  const openCreateModal = () => {
    resetForm();

    setShowCreateModal(true);
  };


  const closeCreateModal = () => {
    setShowCreateModal(false);

    resetForm();
  };


  /* =====================================================
     CREATE TEST
     ===================================================== */

  const handleCreateTest = async (e) => {
    e.preventDefault();

    const title =
      form.title.trim();

    const categoryId =
      Number(form.category_id);

    const duration =
      Number(form.duration);

    const description =
      form.description.trim();


    if (!title) {
      alert(
        "Please enter test title."
      );
      return;
    }


    if (!categoryId) {
      alert(
        "Please select a category."
      );
      return;
    }


    if (
      !duration ||
      duration <= 0
    ) {
      alert(
        "Please enter a valid duration."
      );
      return;
    }


    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/tests`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title,
            category_id:
              categoryId,
            duration,
            description,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        alert(
          data.message ||
          data.error ||
          "Failed to create test"
        );

        return;
      }


      setShowCreateModal(false);

      resetForm();

      await loadTests();

      alert(
        "Test created successfully!"
      );

    } catch (error) {
      console.error(
        "CREATE TEST ERROR:",
        error
      );

      alert(
        "Server error while creating test."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     EDIT MODAL
     ===================================================== */

  const openEditModal = (test) => {
    setEditingTest(test);

    const selectedCategory =
      categories.find(
        (category) =>
          String(category.id) ===
          String(test.category_id)
      );


    /*
      If backend does not return category_id,
      find category by category name.
    */

    const categoryByName =
      categories.find(
        (category) =>
          category.name ===
          test.category
      );


    const finalCategory =
      selectedCategory ||
      categoryByName;


    setForm({
      title:
        test.title || "",

      category_id:
        finalCategory
          ? finalCategory.id
          : "",

      duration:
        test.duration || 10,

      description:
        test.description || "",
    });


    setShowEditModal(true);
  };


  const closeEditModal = () => {
    setShowEditModal(false);

    setEditingTest(null);

    resetForm();
  };


  /* =====================================================
     UPDATE TEST
     ===================================================== */

  const handleUpdateTest = async (e) => {
    e.preventDefault();

    if (!editingTest) {
      return;
    }


    const title =
      form.title.trim();

    const categoryId =
      Number(form.category_id);

    const duration =
      Number(form.duration);

    const description =
      form.description.trim();


    if (!title) {
      alert(
        "Please enter test title."
      );
      return;
    }


    if (!categoryId) {
      alert(
        "Please select a category."
      );
      return;
    }


    if (
      !duration ||
      duration <= 0
    ) {
      alert(
        "Please enter a valid duration."
      );
      return;
    }


    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");


      const response = await fetch(
        `${API_URL}/api/admin/tests/${editingTest.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title,
            category_id:
              categoryId,
            duration,
            description,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        console.error(
          "UPDATE RESPONSE:",
          data
        );

        alert(
          data.message ||
          data.error ||
          "Failed to update test"
        );

        return;
      }


      setShowEditModal(false);

      setEditingTest(null);

      resetForm();

      await loadTests();

      alert(
        "Test updated successfully!"
      );

    } catch (error) {
      console.error(
        "UPDATE TEST ERROR:",
        error
      );

      alert(
        "Server error while updating test."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     DELETE TEST
     ===================================================== */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this test?"
      );


    if (!confirmed) {
      return;
    }


    try {
      const token =
        localStorage.getItem("token");


      const response = await fetch(
        `${API_URL}/api/admin/tests/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        alert(
          data.message ||
          data.error ||
          "Failed to delete test"
        );

        return;
      }


      await loadTests();


      alert(
        "Test deleted successfully!"
      );

    } catch (error) {
      console.error(
        "DELETE TEST ERROR:",
        error
      );

      alert(
        "Server error while deleting test."
      );
    }
  };


  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="admin-loading">

        <div className="admin-loading-spinner"></div>

        <p>
          Loading tests...
        </p>

      </div>
    );
  }


  /* =====================================================
     MAIN UI
     ===================================================== */

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
      className="admin-menu-item active"
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
      onClick={logout}
    >
      🚪 Logout
    </button>

  </div>

</aside>



      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="admin-main">


        {/* TOP BAR */}

        <div className="admin-topbar">

          <div>

            <h1>
              Tests
            </h1>

            <p>
              Manage all online tests
            </p>

          </div>


          <div className="admin-topbar-actions">

            <button
              className="refresh-btn"
              onClick={loadTests}
            >
              🔄 Refresh
            </button>


            <button
              className="create-test-btn"
              onClick={openCreateModal}
            >
              + Create Test
            </button>

          </div>

        </div>


        {/* =================================================
            TESTS
            ================================================= */}

        {tests.length === 0 ? (

          <div className="empty-questions">

            <div className="empty-question-icon">
              📚
            </div>

            <h3>
              No tests found
            </h3>

            <p>
              Create your first online test.
            </p>


            <button
              className="create-test-btn"
              onClick={openCreateModal}
            >
              + Create Test
            </button>

          </div>

        ) : (

          <div className="admin-tests-grid">

            {tests.map((test) => (

              <div
                className="admin-test-card"
                key={test.id}
              >


                {/* CARD TOP */}

                <div className="admin-test-card-top">

                  <div className="test-card-icon">
                    📝
                  </div>


                  <span className="test-category">
                    {test.category ||
                      "General"}
                  </span>

                </div>


                {/* TITLE */}

                <h2>
                  {test.title}
                </h2>


                {/* DESCRIPTION */}

                <p className="test-description">

                  {test.description ||
                    "Test your knowledge with multiple choice questions."}

                </p>


                {/* INFO */}

                <div className="test-info-row">


                  {/* DURATION */}

                  <div>

                    <span>
                      ⏱️
                    </span>

                    <strong>
                      {test.duration}
                    </strong>{" "}
                    min

                  </div>


                  {/* AUTOMATIC QUESTION COUNT */}

                  <div>

                    <span>
                      ❓
                    </span>

                    <strong>
                      {Number(
                        test.question_count
                      ) || 0}
                    </strong>{" "}

                    {Number(
                      test.question_count
                    ) === 1
                      ? "question"
                      : "questions"}

                  </div>


                </div>


                {/* CARD ACTIONS */}

                <div className="test-card-actions">


                  {/* MANAGE QUESTIONS */}

                  <button
                    className="manage-questions-btn"
                    onClick={() =>
                      navigate(
                        `/admin/tests/${test.id}/questions`
                      )
                    }
                  >

                    👁 Manage Questions

                  </button>


                  {/* EDIT */}

                  <button
                    className="edit-test-btn"
                    onClick={() =>
                      openEditModal(test)
                    }
                  >

                    ✏️ Edit

                  </button>


                  {/* DELETE */}

                  <button
                    className="delete-test-btn"
                    onClick={() =>
                      handleDelete(test.id)
                    }
                  >

                    🗑 Delete

                  </button>


                </div>


              </div>

            ))}

          </div>

        )}

      </main>


      {/* =================================================
          CREATE TEST MODAL
          ================================================= */}

      {showCreateModal && (

        <div
          className="test-modal-overlay"
          onClick={closeCreateModal}
        >

          <div
            className="test-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="test-modal-header">

              <div>

                <h2>
                  Create New Test
                </h2>

                <p>
                  Add a new online test
                </p>

              </div>


              <button
                type="button"
                className="modal-close-btn"
                onClick={
                  closeCreateModal
                }
              >
                ✕
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleCreateTest
              }
            >


              {/* TITLE */}

              <div className="modal-form-group">

                <label>
                  Test Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter test title"
                  required
                />

              </div>


              {/* CATEGORY + DURATION */}

              <div className="modal-form-row">


                {/* CATEGORY */}

                <div className="modal-form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Category
                    </option>


                    {categories.map(
                      (category) => (

                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DURATION */}

                <div className="modal-form-group">

                  <label>
                    Duration (Minutes) *
                  </label>

                  <input
                    type="number"
                    name="duration"
                    value={
                      form.duration
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    required
                  />

                </div>


              </div>


              {/* DESCRIPTION */}

              <div className="modal-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter test description"
                  rows="4"
                />

              </div>


              {/* ACTIONS */}

              <div className="modal-form-actions">


                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={
                    closeCreateModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >

                  {saving
                    ? "Creating..."
                    : "✓ Create Test"}

                </button>


              </div>


            </form>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT TEST MODAL
          ================================================= */}

      {showEditModal && (

        <div
          className="test-modal-overlay"
          onClick={closeEditModal}
        >

          <div
            className="test-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="test-modal-header">

              <div>

                <h2>
                  Edit Test
                </h2>

                <p>
                  Update test information
                </p>

              </div>


              <button
                type="button"
                className="modal-close-btn"
                onClick={
                  closeEditModal
                }
              >
                ✕
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleUpdateTest
              }
            >


              {/* TITLE */}

              <div className="modal-form-group">

                <label>
                  Test Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter test title"
                  required
                />

              </div>


              {/* CATEGORY + DURATION */}

              <div className="modal-form-row">


                {/* CATEGORY */}

                <div className="modal-form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Category
                    </option>


                    {categories.map(
                      (category) => (

                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DURATION */}

                <div className="modal-form-group">

                  <label>
                    Duration (Minutes) *
                  </label>

                  <input
                    type="number"
                    name="duration"
                    value={
                      form.duration
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    required
                  />

                </div>


              </div>


              {/* DESCRIPTION */}

              <div className="modal-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter test description"
                  rows="4"
                />

              </div>


              {/* ONLY ONE ACTION ROW */}

              <div className="modal-form-actions">


                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={
                    closeEditModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >

                  {saving
                    ? "Updating..."
                    : "✓ Update Test"}

                </button>


              </div>


            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminTests;
