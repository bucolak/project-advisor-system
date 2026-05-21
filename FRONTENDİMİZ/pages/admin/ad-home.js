const API_BASE = "https://project-advisor-system-production.up.railway.app";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized");
    window.location.href = "../../index.html";
    return;
  }

  renderSidebar(role);
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

    const fullName = admin
      ? `${admin.firstName || admin.name || ""} ${admin.lastName || ""}`.trim()
      : "";

    const safeName = fullName || "Admin";

    renderTopbar("topbarArea", safeName, "Admin");

    const topNameEl = document.getElementById("adminTopName");
    if (topNameEl) topNameEl.textContent = safeName;

    const welcomeEl = document.getElementById("adminWelcomeText");
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${safeName} 👋`;

  } catch (error) {
    console.error("Admin info error:", error);
  }
}

async function loadAnnouncements(token) {
  const list = document.getElementById("adminAnnouncementsList");
  if (!list) return;

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

    announcements.sort((a, b) => {
      const aId = Number(a.id || a.announcementId || 0);
      const bId = Number(b.id || b.announcementId || 0);
      return bId - aId;
    });

    list.innerHTML = "";

    announcements.slice(0, 3).forEach(announcement => {
      const item = document.createElement("div");
      item.className = "admin-home-ann-item";

      item.innerHTML = `
        <i class="fa-regular fa-calendar"></i>
        <span>${announcement.title || announcement.description || announcement.content || "-"}</span>
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

    const totalEl = document.getElementById("totalUsersText");
    const activeEl = document.getElementById("activeUsersText");
    const inactiveEl = document.getElementById("inactiveUsersText");

    if (totalEl) totalEl.textContent = `Total Users: ${total}`;
    if (activeEl) activeEl.textContent = `Active: ${active}`;
    if (inactiveEl) inactiveEl.textContent = `Deactivated: ${inactive}`;

  } catch (error) {
    console.error("Users overview error:", error);
  }
}

async function loadProjectCategories(token) {
  const wrapper = document.getElementById("adminCategoriesWrapper");
  if (!wrapper) return;

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

    categories.sort((a, b) => {
      const aId = Number(a.id || a.categoryId || 0);
      const bId = Number(b.id || b.categoryId || 0);
      return bId - aId;
    });

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

  if (!modal || !title || !badge || !list) return;

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
      const projectId = project.id || project.projectId;

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

      const detailsBtn = item.querySelector(".admin-projects-detail-btn");

      detailsBtn.addEventListener("click", function () {
        if (!projectId) {
          alert("Project id not found.");
          return;
        }

        window.location.href = `project-details2.html?projectId=${projectId}`;
      });

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

  if (value.includes("TUBITAK") || value.includes("TÜBİTAK")) return "tubitak";
  if (value.includes("TEKNOFEST")) return "teknofest";
  if (value.includes("COURSE")) return "course";

  const customClasses = ["custom-1", "custom-2", "custom-3", "custom-4", "custom-5"];

  let total = 0;
  for (let i = 0; i < value.length; i++) {
    total += value.charCodeAt(i);
  }

  return customClasses[total % customClasses.length];
}