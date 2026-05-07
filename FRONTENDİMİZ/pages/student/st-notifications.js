const API_BASE = "http://localhost:8080";

let currentStudentRequest = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupModal();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "STUDENT") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  renderSidebar(role);
  await loadStudentProfile(token, userId);
  await loadNotifications(token);
  await loadIncomingStudentRequest(token);
});

function setupModal() {
  const closeBtn = document.getElementById("closeStudentProfileBtn");
  const viewBtn = document.getElementById("viewStudentProfileBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeStudentProfile);
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", function () {
      if (currentStudentRequest) {
        openStudentProfile();
      }
    });
  }

  const modal = document.getElementById("studentProfileOverlay");

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeStudentProfile();
    }
  });
}

async function loadStudentProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) return;

    const p = result.data;
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Student";

    renderTopbar("topbarArea", fullName, "Student");

  } catch (error) {
    console.error("Student profile load error:", error);
  }
}

async function loadNotifications(token) {
  const list = document.getElementById("notificationsList");
  const count = document.getElementById("notificationsNewCount");

  try {
    const response = await fetch(`${API_BASE}/api/notifications/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("NOTIFICATION STATUS:", response.status);
    console.log("NOTIFICATION RESPONSE:", text);

    if (!response.ok) {
      renderNoNotifications();
      return;
    }

    const result = JSON.parse(text);
    const notifications = result.data || [];

    if (!notifications.length) {
      renderNoNotifications();
      return;
    }

    list.innerHTML = "";

    const unreadCount = notifications.filter(
      n => n.isRead === false || n.isRead === null
    ).length;

    count.textContent = `${unreadCount} New`;

    notifications.forEach(notification => {
      const item = document.createElement("div");
      item.className = "notification-item";

      item.innerHTML = `
        <i class="fa-regular fa-circle-user"></i>
        <span>${notification.message || "Notification"}</span>
      `;

      list.appendChild(item);
    });

  } catch (error) {
    console.error("Notification load error:", error);
    renderNoNotifications();
  }
}

function renderNoNotifications() {
  const list = document.getElementById("notificationsList");

  if (list) {
    list.innerHTML = `
      <div class="notification-item no-notification-box">
        <i class="fa-regular fa-circle-user"></i>
        <span>No new notifications.</span>
      </div>
    `;
  }
}

function updateTotalNotificationCount(extraPendingCount = 0) {
  const count = document.getElementById("notificationsNewCount");
  const items = document.querySelectorAll("#notificationsList .notification-item:not(.no-notification-box)");

  const normalCount = items.length;
  const total = normalCount + extraPendingCount;

  if (count) {
    count.textContent = `${total} New`;
  }
}

async function loadIncomingStudentRequest(token) {
  const section = document.getElementById("studentRequestSection");

  try {
    const response = await fetch(`${API_BASE}/api/projects/incoming-applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      section.innerHTML = "";
      updateTotalNotificationCount(0);
      return;
    }

    const result = await response.json();
    const requests = result.data || [];

    if (!requests.length) {
      section.innerHTML = "";
      updateTotalNotificationCount(0);
      return;
    }

    section.innerHTML = "";

    requests.forEach(request => {
      const status = String(request.status || "").toUpperCase();

      const studentName =
        request.student?.user
          ? `${request.student.user.firstName || ""} ${request.student.user.lastName || ""}`.trim()
          : "Student";

      const projectTitle = request.project?.title || "-";

      const card = document.createElement("div");
      card.className = "student-request-card";
      card.style.display = "flex";

      card.innerHTML = `
        <div class="student-request-left">
          <i class="fa-regular fa-circle-user"></i>
        </div>

        <div class="student-request-middle">
          <p>
            <strong>${studentName}</strong>
            wants to join your project
            <strong>${projectTitle}</strong>
          </p>

          <div class="student-request-actions">
            ${
              status === "PENDING"
                ? `
                  <button class="accept-btn">Accept</button>
                  <button class="reject-btn">Reject</button>
                `
                : `<div class="student-request-final ${status.toLowerCase()}">${status}</div>`
            }
          </div>
        </div>

        <div class="student-request-right">
          <button class="view-profile-btn">
            view student profile
          </button>
        </div>
      `;

      const acceptBtn = card.querySelector(".accept-btn");
      const rejectBtn = card.querySelector(".reject-btn");
      const viewBtn = card.querySelector(".view-profile-btn");

      if (acceptBtn) {
        acceptBtn.addEventListener("click", function () {
          respondToStudentRequest(request, "ACCEPTED", card);
        });
      }

      if (rejectBtn) {
        rejectBtn.addEventListener("click", function () {
          respondToStudentRequest(request, "REJECTED", card);
        });
      }

      if (viewBtn) {
        viewBtn.addEventListener("click", function () {
          currentStudentRequest = request;
          fillStudentProfileModal(request);
          openStudentProfile();
        });
      }

      section.appendChild(card);
    });

    updateTotalNotificationCount(requests.length);

  } catch (error) {
    console.error("Incoming student request load error:", error);
    section.innerHTML = "";
    updateTotalNotificationCount(0);
  }
}

function fillStudentProfileModal(data) {
  const student = data.student;
  const project = data.project;

  const studentName =
    student?.user
      ? `${student.user.firstName || ""} ${student.user.lastName || ""}`.trim()
      : "Student";

  const type = project?.category?.name || "PROJECT";

  document.getElementById("studentProfileTag").textContent = type;
  document.getElementById("modalStudentName").textContent = studentName;
  document.getElementById("modalStudentDepartment").textContent = student?.department || "-";

  setListItems("modalRelevantCourses", []);
  setListItems("modalResearchInterests", []);

  document.getElementById("modalStudentProjects").innerHTML = `
    <div class="student-project-card">
      <div class="student-project-header">
        <h4>${project?.title || "-"}</h4>
        <span class="student-project-badge ${getProjectBadgeClass(type)}">
          ${type}
        </span>
      </div>

      <div class="student-project-body">
        <p><strong>Project:</strong> ${project?.description || "-"}</p>
      </div>

      <div class="student-project-footer">
        <p><strong>Skills:</strong> ${student?.skills || "-"}</p>
      </div>
    </div>
  `;
}

function setListItems(id, items) {
  const list = document.getElementById(id);

  if (!items.length) {
    list.innerHTML = "<li>No data</li>";
    return;
  }

  list.innerHTML = "";

  items.forEach(x => {
    const li = document.createElement("li");
    li.textContent = x;
    list.appendChild(li);
  });
}

function getProjectBadgeClass(type) {
  const v = String(type).toUpperCase();

  if (v.includes("TUBITAK") || v.includes("TÜBİTAK")) return "tubitak";
  if (v.includes("TEKNOFEST")) return "teknofest";

  return "tubitak";
}

function openStudentProfile() {
  document.getElementById("studentProfileOverlay").classList.add("show");
}

function closeStudentProfile() {
  document.getElementById("studentProfileOverlay").classList.remove("show");
}

async function respondToStudentRequest(request, status, card) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API_BASE}/api/projects/applications/${request.id}/respond/${status}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      alert("Failed to update student request.");
      return;
    }

    if (request.notificationId) {
      await fetch(
        `${API_BASE}/api/notifications/${request.notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }

    card.remove();

    await loadNotifications(token);
    await loadIncomingStudentRequest(token);

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}