const API_BASE = "http://localhost:8080";

let currentStudentRequest = null;
let notificationBaseNewCount = 0;
let notificationLastSeenDate = null;
let notificationLastSeenKey = null;

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

  notificationLastSeenKey = `studentNotificationsLastSeenAt_${userId}`;
  const lastSeenValue = localStorage.getItem(notificationLastSeenKey);
  notificationLastSeenDate = lastSeenValue ? new Date(lastSeenValue) : null;

  renderSidebar(role);
  await loadStudentProfile(token, userId);
  await loadNotifications(token);
  await loadIncomingStudentRequest(token);

  localStorage.setItem(notificationLastSeenKey, new Date().toISOString());
});

function setupModal() {
  const closeBtn = document.getElementById("closeStudentProfileBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeStudentProfile);
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

    if (!response.ok) {
      renderNoNotifications();
      notificationBaseNewCount = 0;
      if (count) count.textContent = "0 New";
      return;
    }

    const result = JSON.parse(text);
    const notifications = result.data || [];

    const filteredNotifications = notifications.filter(n => {
      const message = String(n.message || "").toLowerCase();

      return !(
        message.includes("yeni duyuru") ||
        message.includes("new announcement") ||
        message.includes("wants to join your project")
      );
    });

    if (!filteredNotifications.length) {
      renderNoNotifications();
      notificationBaseNewCount = 0;
      if (count) count.textContent = "0 New";
      return;
    }

    list.innerHTML = "";

    notificationBaseNewCount = filteredNotifications.filter(n => {
      if (!notificationLastSeenDate) return true;
      if (!n.createdAt) return false;

      return new Date(n.createdAt) > notificationLastSeenDate;
    }).length;

    if (count) {
      count.textContent = `${notificationBaseNewCount} New`;
    }

    filteredNotifications.forEach(notification => {
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
    notificationBaseNewCount = 0;
    if (count) count.textContent = "0 New";
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

function updateTotalNotificationCount(extraNewCount = 0) {
  const count = document.getElementById("notificationsNewCount");
  if (!count) return;

  count.textContent = `${notificationBaseNewCount + extraNewCount} New`;
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

    const newIncomingCount = requests.filter(request => {
      if (!notificationLastSeenDate) return true;

      const dateValue =
        request.appliedAt ||
        request.createdAt ||
        request.requestDate;

      if (!dateValue) return false;

      return new Date(dateValue) > notificationLastSeenDate;
    }).length;

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
        viewBtn.addEventListener("click", async function () {
          currentStudentRequest = request;
          await fillStudentProfileModal(request);
          openStudentProfile();
        });
      }

      section.appendChild(card);
    });

    updateTotalNotificationCount(newIncomingCount);

  } catch (error) {
    console.error("Incoming student request load error:", error);
    section.innerHTML = "";
    updateTotalNotificationCount(0);
  }
}

async function fillStudentProfileModal(data) {
  const token = localStorage.getItem("token");

  const student = data.student;
  const project = data.project;

  const studentUserId =
    student?.userId ||
    student?.user?.id ||
    student?.id;

  let profile = null;
  let studentProjects = [];

  if (studentUserId) {
    try {
      const response = await fetch(`${API_BASE}/api/students/${studentUserId}/profile-with-projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        profile = result.data.profile;
        studentProjects = result.data.projects || [];
      }
    } catch (error) {
      console.error("Modal student profile load error:", error);
    }
  }

  const studentName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : student?.user
      ? `${student.user.firstName || ""} ${student.user.lastName || ""}`.trim()
      : "Student";

  document.getElementById("modalStudentName").textContent = studentName || "Student";
  document.getElementById("modalStudentDepartment").textContent =
    profile?.department || student?.department || "-";

  const tag = document.getElementById("studentProfileTag");
  if (tag) tag.style.display = "none";

  setListItems(
    "modalRelevantCourses",
    splitToList(profile?.researchInterests || student?.researchInterests)
  );

  setListItems(
    "modalResearchInterests",
    splitToList(profile?.skills || student?.skills)
  );

  renderModalStudentProjects(studentProjects);
}

function renderModalStudentProjects(projects) {
  const container = document.getElementById("modalStudentProjects");

  const cleanProjects = (projects || [])
    .filter(Boolean)
    .slice(0, 2);

  if (!cleanProjects.length) {
    container.innerHTML = `
      <div class="student-project-card">
        <div class="student-project-header">
          <h4>No project</h4>
        </div>
        <div class="student-project-body">
          <p><strong>Project:</strong> No data</p>
        </div>
        <div class="student-project-footer">
          <p><strong>Skills:</strong> -</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  cleanProjects.forEach(project => {
    const categoryName =
      project.category?.name ||
      project.categoryName ||
      project.projectType ||
      "PROJECT";

    const card = document.createElement("div");
    card.className = "student-project-card";

    card.innerHTML = `
      <div class="student-project-header">
        <h4>${project.title || "-"}</h4>
      </div>

      <div class="student-project-body">
        <p><strong>Project:</strong> ${categoryName}</p>
      </div>

      <div class="student-project-footer">
        <p><strong>Skills:</strong> ${project.requiredSkills || project.skills || "-"}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function splitToList(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

function setListItems(id, items) {
  const list = document.getElementById(id);

  if (!list) return;

  if (!items || !items.length) {
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

    const actionsArea = card.querySelector(".student-request-actions");

    if (actionsArea) {
      actionsArea.innerHTML = `
        <div class="student-request-final ${status.toLowerCase()}">
          ${status}
        </div>
      `;
    }

    request.status = status;

    await loadNotifications(token);

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}