const API_BASE = "http://localhost:8080";

let currentAnnouncementId = null;

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  currentAnnouncementId = params.get("id");

  if (!currentAnnouncementId) {
    alert("Announcement id not found.");
    window.location.href = "ad-announce.html";
    return;
  }
renderSidebar(role);
  await loadAdminInfo(token, userId);
  await loadCategories(token);
  await loadAnnouncementTypes(token);
  await loadAnnouncementDetail(token, currentAnnouncementId);

  setupEditAnnouncementForm(token);
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
    renderTopbar("topbarArea", fullName, "Admin");
    document.getElementById("adminTopName").textContent = fullName || "Admin";

  } catch (error) {
    console.error("Admin info load error:", error);
  }
}

async function loadCategories(token) {
  const select = document.getElementById("announcementCategory");

  try {
    const response = await fetch(`${API_BASE}/api/admin/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      select.innerHTML = `<option value="">Could not load categories</option>`;
      return;
    }

    const result = await response.json();
    const categories = result.data || result || [];

    select.innerHTML = `<option value="">Select a project type</option>`;

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      option.dataset.id = category.id;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Category load error:", error);
    select.innerHTML = `<option value="">Server error</option>`;
  }
}

async function loadAnnouncementTypes(token) {
  const select = document.getElementById("announcementType");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcement-types`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      select.innerHTML = `<option value="">Could not load announcement types</option>`;
      return;
    }

    const result = await response.json();
    const types = result.data || result || [];

    select.innerHTML = `<option value="">Select announcement type</option>`;

    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type.name;
      option.textContent = type.name;
      option.dataset.id = type.id;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Announcement type load error:", error);
    select.innerHTML = `<option value="">Server error</option>`;
  }
}

async function loadAnnouncementDetail(token, id) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("EDIT ANN DETAIL STATUS:", response.status);
    console.log("EDIT ANN DETAIL RESPONSE:", text);

    if (!response.ok) {
      alert("Announcement detail could not be loaded.");
      window.location.href = "ad-announce.html";
      return;
    }

    const result = JSON.parse(text);
    const announcement = result.data || result;

    fillEditForm(announcement);

  } catch (error) {
    console.error("Announcement detail load error:", error);
    alert("Server error while loading announcement detail.");
  }
}

function fillEditForm(announcement) {
  document.getElementById("announcementTitle").value =
    announcement.title || "";

  document.getElementById("announcementCategory").value =
    announcement.category || "";

  document.getElementById("announcementDeadline").value =
    formatDateForInput(announcement.deadline);

  document.getElementById("announcementType").value =
    announcement.type || "";

  document.getElementById("announcementDescription").value =
    announcement.description || "";
}

function setupEditAnnouncementForm(token) {
  const form = document.getElementById("editAnnouncementForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("announcementTitle").value.trim();
    const category = document.getElementById("announcementCategory").value;
    const deadline = document.getElementById("announcementDeadline").value;
    const type = document.getElementById("announcementType").value;
    const description = document.getElementById("announcementDescription").value.trim();

    if (!title || !category || !deadline || !type || !description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${currentAnnouncementId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          category,
          deadline,
          type,
          description
        })
      });

      const text = await response.text();

      console.log("UPDATE ANNOUNCEMENT STATUS:", response.status);
      console.log("UPDATE ANNOUNCEMENT RESPONSE:", text);

      if (!response.ok) {
        alert("Announcement could not be updated.");
        return;
      }

      alert("Announcement updated successfully.");
      window.location.href = "ad-announce.html";

    } catch (error) {
      console.error("Announcement update error:", error);
      alert("Server error while updating announcement.");
    }
  });
}

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}