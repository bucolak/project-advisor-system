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
  await loadAllNotificationItems(token);

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

async function loadAllNotificationItems(token) {
  const list = document.getElementById("notificationsList");
  const section = document.getElementById("studentRequestSection");
  const count = document.getElementById("notificationsNewCount");

  if (section) section.innerHTML = "";

  try {
    const [notifResponse, requestResponse] = await Promise.all([
      fetch(`${API_BASE}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/projects/incoming-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    let allItems = [];

    if (notifResponse.ok) {
      const notifResult = await notifResponse.json();
      const notifications = notifResult.data || [];

      const filteredNotifications = notifications.filter(n => {
        const message = String(n.message || "").toLowerCase();

        return !(
          message.includes("yeni duyuru") ||
          message.includes("new announcement") ||
          message.includes("wants to join your project")
        );
      });

      filteredNotifications.forEach(n => {
        allItems.push({
          type: "NORMAL",
          date: n.createdAt,
          data: n
        });
      });
    }

    if (requestResponse.ok) {
      const requestResult = await requestResponse.json();
      const requests = requestResult.data || [];

      requests.forEach(r => {
        allItems.push({
          type: "APPLICATION",
          date: r.appliedAt || r.createdAt || r.requestDate,
          data: r
        });
      });
    }

    allItems.sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    if (!allItems.length) {
      renderNoNotifications();
      notificationBaseNewCount = 0;
      if (count) count.textContent = "0 New";
      return;
    }

    const newCount = allItems.filter(item => {
      if (!notificationLastSeenDate) return true;
      if (!item.date) return false;

      const isNewByDate = new Date(item.date) > notificationLastSeenDate;

      if (!isNewByDate) return false;

      if (item.type === "APPLICATION") {
        const status = String(item.data.status || "").toUpperCase();
        return status === "PENDING";
      }

      return item.data.isRead === false || item.data.isRead === null;
    }).length;

    notificationBaseNewCount = newCount;

    if (count) {
      count.textContent = `${newCount} New`;
    }

    list.innerHTML = "";

    allItems.forEach(item => {
      if (item.type === "APPLICATION") {
        list.appendChild(createStudentRequestCard(item.data));
      } else {
        list.appendChild(createNormalNotificationCard(item.data));
      }
    });

    await markNormalNotificationsAsRead(token, allItems);

  } catch (error) {
    console.error("Notification list load error:", error);
    renderNoNotifications();
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

function createNormalNotificationCard(notification) {
  const item = document.createElement("div");
  item.className = "notification-item";

  item.innerHTML = `
    <i class="fa-regular fa-circle-user"></i>
    <span>${notification.message || "Notification"}</span>
  `;

  return item;
}

function createStudentRequestCard(request) {
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

  return card;
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

    await loadAllNotificationItems(token);

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}

async function markNormalNotificationsAsRead(token, allItems) {
  const unreadNotifications = allItems
    .filter(item => item.type === "NORMAL")
    .map(item => item.data)
    .filter(notification => notification && notification.isRead === false);

  for (const notification of unreadNotifications) {
    try {
      await fetch(`${API_BASE}/api/notifications/${notification.id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  }
}