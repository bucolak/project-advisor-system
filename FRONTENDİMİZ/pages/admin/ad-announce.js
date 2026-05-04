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
renderSidebar(role);
  await loadAdminInfo(token, userId);
  await loadAnnouncements(token);
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

    if (fullName) {
      renderTopbar("topbarArea", fullName, "Admin");
      document.getElementById("adminTopName").textContent = fullName;
    }

  } catch (error) {
    console.error("Admin info load error:", error);
  }
}

async function loadAnnouncements(token) {
  const container = document.getElementById("announcementList");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("ANN STATUS:", response.status);
    console.log("ANN RESPONSE:", text);

    if (!response.ok) {
      container.innerHTML = `
        <div class="admin-ann-card">
          Announcements could not be loaded.
        </div>
      `;
      return;
    }

    const result = JSON.parse(text);
    const announcements = result.data || result || [];

    if (!announcements.length) {
      container.innerHTML = `
        <div class="admin-ann-card">
          No announcements found.
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    announcements.forEach(item => {
      const id = item.id || item.announcementId;
      const category = String(item.category || "").toUpperCase();

      let badgeClass = "course";
      let badgeText = category || "-";

      if (category === "TÜBİTAK" || category === "TUBITAK") {
        badgeClass = "tubitak";
        badgeText = "TÜBİTAK";
      }

      if (category === "TEKNOFEST") {
        badgeClass = "teknofest";
        badgeText = "TEKNOFEST";
      }

      if (category === "COURSE") {
        badgeClass = "course";
        badgeText = "COURSE";
      }

      const note = item.type || "Announcement";
      const deadline = formatDate(item.deadline);

      const card = document.createElement("div");
      card.className = "admin-ann-card ann-row";

      card.innerHTML = `
        <div class="admin-ann-left">
          <i class="fa-regular fa-calendar admin-ann-calendar blue"></i>

          <div class="admin-ann-text">
            <h3>${item.title || "-"}</h3>

            <div class="admin-ann-inline">
              <span class="admin-ann-badge ${badgeClass}">
                ${badgeText}
              </span>

              <span class="admin-ann-date">
                ${deadline}
              </span>
            </div>

            <div class="admin-ann-note normal">
              ${note}
            </div>
          </div>
        </div>

        <div class="admin-ann-actions">
          <a href="ad-editannouncement.html?id=${id}" class="admin-ann-edit-btn">
            Edit
          </a>

          <button class="admin-ann-delete-btn" type="button" data-announcement-id="${id}">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      const deleteBtn = card.querySelector(".admin-ann-delete-btn");
      deleteBtn.addEventListener("click", function () {
        deleteAnnouncement(id);
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="admin-ann-card">
        Server error loading announcements.
      </div>
    `;
  }
}

async function deleteAnnouncement(id) {
  const confirmed = confirm("Are you sure you want to delete this announcement?");
  if (!confirmed) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert("Delete failed.");
      return;
    }

    alert("Announcement deleted.");
    loadAnnouncements(token);

  } catch (error) {
    console.error(error);
    alert("Server error.");
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}