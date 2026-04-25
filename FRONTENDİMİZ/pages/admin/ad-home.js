const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized");
    window.location.href = "../../index.html";
    return;
  }

  setupModal();

  await loadAdminInfo(token, userId);
  await loadAnnouncements(token);
  await loadUsersOverview(token);
  await loadProjectCategories(token);
});

async function loadAdminInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
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

    if (!fullName) return;

    document.getElementById("adminTopName").textContent = fullName;
    document.getElementById("adminWelcomeText").textContent = `Welcome, ${fullName} 👋`;

  } catch (error) {
    console.error("Admin info error:", error);
  }
}

async function loadAnnouncements(token) {
  const list = document.getElementById("adminAnnouncementsList");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      list.innerHTML = `
        <div class="admin-home-ann-item">
          <i class="fa-regular fa-calendar"></i>
          <span>No announcements found.</span>
        </div>
      `;
      return;
    }

    const result = await response.json();
    const announcements = result.data || result || [];

    if (!announcements.length) {
      list.innerHTML = `
        <div class="admin-home-ann-item">
          <i class="fa-regular fa-calendar"></i>
          <span>No announcements found.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = "";

    announcements.slice(0, 3).forEach(announcement => {
      const item = document.createElement("div");
      item.className = "admin-home-ann-item";

      item.innerHTML = `
        <i class="fa-regular fa-calendar"></i>
        <span>${announcement.title || announcement.description || "-"}</span>
      `;

      list.appendChild(item);
    });

  } catch (error) {
    console.error("Announcements error:", error);
  }
}

async function loadUsersOverview(token) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const users = result.data || result || [];

    const total = users.length;
    const active = users.filter(user =>
      String(user.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const inactive = total - active;

    document.getElementById("totalUsersText").textContent = `Total Users: ${total}`;
    document.getElementById("activeUsersText").textContent = `Active: ${active}`;
    document.getElementById("inactiveUsersText").textContent = `Deactivated: ${inactive}`;

  } catch (error) {
    console.error("Users overview error:", error);
  }
}

async function loadProjectCategories(token) {
  const wrapper = document.getElementById("adminCategoriesWrapper");

  try {
    const response = await fetch(`${API_BASE}/api/admin/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      wrapper.innerHTML = `
        <div class="admin-home-category-card">
          <div class="admin-home-category-body">
            <h4>No categories found.</h4>
          </div>
        </div>
      `;
      return;
    }

    const result = await response.json();
    const categories = result.data || result || [];

    if (!categories.length) {
      wrapper.innerHTML = `
        <div class="admin-home-category-card">
          <div class="admin-home-category-body">
            <h4>No categories found.</h4>
          </div>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = "";

    categories.forEach(category => {
      const categoryId = category.id || category.categoryId;
      const categoryName = category.name || category.categoryName || "-";

      const card = document.createElement("div");
      card.className = "admin-home-category-card";

      card.innerHTML = `
        <div class="admin-home-category-body">
          <h4>${categoryName}</h4>

          <p>${category.description || ""}</p>

          <div class="admin-home-line"></div>

          <p>
            <strong>Active Projects:</strong>
            ${category.projectCount ?? category.activeProjects ?? 0}
          </p>
        </div>

        <div class="admin-home-category-footer">
          <span class="admin-home-badge ${getCategoryBadgeClass(categoryName)}">
            ${categoryName}
          </span>

          <button type="button">View</button>
        </div>
      `;

      card.querySelector("button").addEventListener("click", function () {
        openCategoryProjectsModal(categoryId, categoryName, token);
      });

      wrapper.appendChild(card);
    });

  } catch (error) {
    console.error("Categories error:", error);
  }
}

async function openCategoryProjectsModal(categoryId, categoryName, token) {
  const modal = document.getElementById("categoryProjectsModal");
  const title = document.getElementById("modalCategoryTitle");
  const badge = document.getElementById("modalCategoryBadge");
  const list = document.getElementById("modalProjectsList");

  title.textContent = `${categoryName} Projects`;
  badge.textContent = categoryName;

  list.innerHTML = `
    <div class="admin-projects-modal-item">
      <span class="admin-projects-name">Loading projects...</span>
    </div>
  `;

  modal.classList.add("show");

  try {
    const response = await fetch(`${API_BASE}/api/projects/category/${categoryId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      list.innerHTML = `
        <div class="admin-projects-modal-item">
          <span class="admin-projects-name">No projects found.</span>
        </div>
      `;
      return;
    }

    const result = await response.json();
    const projects = result.data || result || [];

    if (!projects.length) {
      list.innerHTML = `
        <div class="admin-projects-modal-item">
          <span class="admin-projects-name">No projects found.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = "";

    projects.forEach(project => {
      const item = document.createElement("div");
      item.className = "admin-projects-modal-item";

      item.innerHTML = `
        <span class="admin-projects-dot"></span>

        <span class="admin-projects-name">
          ${project.title || project.name || "-"}
        </span>

        <button class="admin-projects-detail-btn" type="button">
          View Details
        </button>
      `;

      list.appendChild(item);
    });

  } catch (error) {
    console.error("Category projects error:", error);
  }
}

function setupModal() {
  const modal = document.getElementById("categoryProjectsModal");
  const closeBtn = document.getElementById("closeCategoryProjectsModal");

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", function () {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
}

function getCategoryBadgeClass(name) {
  const value = String(name || "").toUpperCase();

  if (value.includes("TUBITAK") || value.includes("TÜBİTAK")) {
    return "tubitak";
  }

  if (value.includes("TEKNOFEST")) {
    return "teknofest";
  }

  if (value.includes("COURSE")) {
    return "course";
  }

  return "course";
}