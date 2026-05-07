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
  const card = document.getElementById("studentRequestCard");
  const count = document.getElementById("notificationsNewCount");

  try {
    const response = await fetch(`${API_BASE}/api/projects/incoming-applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      card.style.display = "none";
      updateTotalNotificationCount(0);
      return;
    }

    const result = await response.json();
    const requests = result.data || [];

    if (!requests.length) {
      card.style.display = "none";
      updateTotalNotificationCount(0);
      return;
    }

    currentStudentRequest = requests[0];

    card.style.display = "flex";

    const status = String(currentStudentRequest.status || "").toUpperCase();

    const studentName =
      currentStudentRequest.student?.user
        ? `${currentStudentRequest.student.user.firstName || ""} ${currentStudentRequest.student.user.lastName || ""}`.trim()
        : "Student";

    const projectTitle = currentStudentRequest.project?.title || "-";

    document.getElementById("studentRequestText").innerHTML = `
      <strong>${studentName}</strong>
      wants to join your project
      <strong>${projectTitle}</strong>
    `;

    const actions = document.getElementById("studentRequestActions");

    if (status === "ACCEPTED") {
      actions.innerHTML = `<div class="student-request-final accepted">Accepted</div>`;
      updateTotalNotificationCount(0);
    } else if (status === "REJECTED") {
      actions.innerHTML = `<div class="student-request-final rejected">Rejected</div>`;
      updateTotalNotificationCount(0);
    } else {
      actions.innerHTML = `
        <button class="accept-btn" id="acceptStudentRequestBtn">Accept</button>
        <button class="reject-btn" id="rejectStudentRequestBtn">Reject</button>
      `;

      document.getElementById("acceptStudentRequestBtn").addEventListener("click", function () {
        respondToStudentRequest("ACCEPTED");
      });

      document.getElementById("rejectStudentRequestBtn").addEventListener("click", function () {
        respondToStudentRequest("REJECTED");
      });

      updateTotalNotificationCount(requests.length);
    }

    fillStudentProfileModal(currentStudentRequest);

  } catch (error) {
    console.error("Incoming student request load error:", error);
    card.style.display = "none";
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

async function respondToStudentRequest(status) {
  if (!currentStudentRequest) return;

  const token = localStorage.getItem("token");
  const actions = document.getElementById("studentRequestActions");

  try {
    const response = await fetch(
      `${API_BASE}/api/projects/applications/${currentStudentRequest.id}/respond/${status}`,
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

    if (currentStudentRequest.notificationId) {
      await fetch(
        `${API_BASE}/api/notifications/${currentStudentRequest.notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }

    if (status === "ACCEPTED") {
      actions.innerHTML = `<div class="student-request-final accepted">Accepted</div>`;
    } else {
      actions.innerHTML = `<div class="student-request-final rejected">Rejected</div>`;
    }

    document.getElementById("studentRequestCard").style.display = "none";

    await loadNotifications(token);
    updateTotalNotificationCount(0);

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}