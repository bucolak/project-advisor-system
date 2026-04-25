const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdminInfo(token, userId);
  await loadCategories(token);
});

async function loadAdminInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const users = result.data || result || [];

    const admin = users.find(user =>
      String(user.id) === String(userId) ||
      String(user.userId) === String(userId)
    );

    if (!admin) return;

    const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim();

    if (fullName) {
      document.getElementById("adminTopName").textContent = fullName;
    }

  } catch (error) {
    console.error("Admin info load error:", error);
  }
}

async function loadCategories(token) {
  const tbody = document.getElementById("categoriesTableBody");

  try {
    const response = await fetch(`${API_BASE}/api/admin/categories`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("CATEGORIES STATUS:", response.status);
    console.log("CATEGORIES RESPONSE:", text);

    if (!response.ok) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">Could not load categories.</td>
        </tr>
      `;
      return;
    }

    const result = JSON.parse(text);
    const categories = result.data || result || [];

    if (!categories.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">No categories found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    categories.forEach(category => {
      const categoryId = category.id || category.categoryId;
      const categoryName = category.name || category.categoryName || "-";
      const description = category.description || "-";
      const activeProjects = category.activeProjects ?? category.projectCount ?? 0;
      const deadlines = category.deadlines ?? category.deadlineCount ?? 0;

      const tr = document.createElement("tr");
      tr.className = "category-row";

      tr.innerHTML = `
        <td>${categoryName}</td>
        <td>${description}</td>
        <td>${activeProjects}</td>
        <td>${deadlines}</td>
        <td>
          <div class="admin-categories-actions">
            <a href="ad-editcategory.html?id=${categoryId}" class="edit-btn">Edit</a>
            <button class="delete-btn" data-category-id="${categoryId}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    setupDeleteButtons(token);

  } catch (error) {
    console.error("Category load error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Server error while loading categories.</td>
      </tr>
    `;
  }
}

function setupDeleteButtons(token) {
  const buttons = document.querySelectorAll(".delete-btn");

  buttons.forEach(button => {
    button.addEventListener("click", async function () {
      const categoryId = this.dataset.categoryId;
      const row = this.closest(".category-row");

      const confirmed = confirm("Are you sure you want to delete this category?");
      if (!confirmed) return;

      try {
        const response = await fetch(`${API_BASE}/api/admin/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          alert("Failed to delete category.");
          return;
        }

        row.remove();

      } catch (error) {
        console.error("Delete category error:", error);
        alert("Server error while deleting category.");
      }
    });
  });
}