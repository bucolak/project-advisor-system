const API_BASE = "http://localhost:8080";

let currentStudentRequest = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupModal();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  console.log("TOKEN:", token);
  console.log("USER ID:", userId);
  console.log("ROLE:", role);

  if (!token || !userId || role !== "STUDENT") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadStudentProfile(token, userId);
  await loadNotifications(token, userId);
  await loadIncomingStudentRequest(token, userId);
});

function setupDropdown() {
  const box = document.getElementById("notificationsStudentBox");
  const dropdown = document.getElementById("notificationProfileDropdown");

  box.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
    if (!box.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("notificationsLogoutBtn");

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

function setupModal() {
  const closeBtn = document.getElementById("closeStudentProfileBtn");
  const viewBtn = document.getElementById("viewStudentProfileBtn");
  const acceptBtn = document.getElementById("acceptStudentRequestBtn");
  const rejectBtn = document.getElementById("rejectStudentRequestBtn");
  const modal = document.getElementById("studentProfileOverlay");

  closeBtn.addEventListener("click", closeStudentProfile);

  viewBtn.addEventListener("click", function () {
    if (currentStudentRequest) {
      openStudentProfile();
    }
  });

  acceptBtn.addEventListener("click", function () {
    respondToStudentRequest("accepted");
  });

  rejectBtn.addEventListener("click", function () {
    respondToStudentRequest("rejected");
  });

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeStudentProfile();
    }
  });
}

async function loadStudentProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return;
    }

    const profile = result.data;
    document.getElementById("notificationsStudentName").textContent =
      `${profile.firstName} ${profile.lastName}`;
  } catch (error) {
    console.error("Student profile load error:", error);
  }
}

async function loadNotifications(token, userId) {
  const notificationsList = document.getElementById("notificationsList");
  const notificationsNewCount = document.getElementById("notificationsNewCount");

  try {
    /*
      Muhtemel endpoint:
      GET /api/notifications/user/{userId}
      veya
      GET /api/notifications/{userId}
    */
    const response = await fetch(`${API_BASE}/api/notifications/user/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("NOTIFICATIONS STATUS:", response.status);
    console.log("NOTIFICATIONS RESPONSE:", text);

    if (!response.ok) {
      notificationsList.innerHTML = `
        <div class="notification-item">
          <i class="fa-regular fa-bell notification-icon warning"></i>
          <span>Could not load notifications.</span>
        </div>
      `;
      notificationsNewCount.textContent = "0 New";
      return;
    }

    const result = JSON.parse(text);
    const notifications = result.data || [];

    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="notification-item">
          <i class="fa-regular fa-bell notification-icon warning"></i>
          <span>No notifications found.</span>
        </div>
      `;
      notificationsNewCount.textContent = "0 New";
      return;
    }

    const unreadCount = notifications.filter(item => item.read === false || item.isRead === false).length;
    notificationsNewCount.textContent = `${unreadCount} New`;

    notificationsList.innerHTML = "";

    notifications.forEach(notification => {
      const item = document.createElement("div");
      item.className = "notification-item";

      const type = (notification.type || "").toLowerCase();
      let iconClass = "fa-regular fa-bell";
      let colorClass = "warning";

      if (type.includes("accept") || type.includes("success")) {
        iconClass = "fa-solid fa-circle-check";
        colorClass = "success";
      } else if (type.includes("reject") || type.includes("danger") || type.includes("decline")) {
        iconClass = "fa-solid fa-xmark";
        colorClass = "danger";
      }

      item.innerHTML = `
        <i class="${iconClass} notification-icon ${colorClass}"></i>
        <span>${notification.message || "-"}</span>
      `;

      notificationsList.appendChild(item);
    });

  } catch (error) {
    console.error("Notifications load error:", error);
    notificationsList.innerHTML = `
      <div class="notification-item">
        <i class="fa-regular fa-bell notification-icon warning"></i>
        <span>Server error while loading notifications.</span>
      </div>
    `;
    notificationsNewCount.textContent = "0 New";
  }
}

async function loadIncomingStudentRequest(token, userId) {
  try {
    /*
      Bu bölüm opsiyonel.
      Eğer backend'de student's own project join requests gibi bir endpoint varsa bağlanır.
      Muhtemel endpoint:
      GET /api/projects/student/${userId}/incoming-requests
      veya
      GET /api/student-requests/${userId}
    */

    const response = await fetch(`${API_BASE}/api/student-requests/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      document.getElementById("studentRequestCard").style.display = "none";
      return;
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      document.getElementById("studentRequestCard").style.display = "none";
      return;
    }

    currentStudentRequest = result.data;

    document.getElementById("studentRequestCard").style.display = "flex";
    document.getElementById("studentRequestText").innerHTML = `
      <strong>${currentStudentRequest.studentName || "Student"}</strong>
      wants to join your project
      ${currentStudentRequest.projectTitle || "-"}
    `;

    fillStudentProfileModal(currentStudentRequest);

  } catch (error) {
    console.error("Incoming student request load error:", error);
    document.getElementById("studentRequestCard").style.display = "none";
  }
}

function fillStudentProfileModal(requestData) {
  document.getElementById("studentProfileTag").textContent =
    requestData.projectType || "PROJECT";

  document.getElementById("modalStudentName").textContent =
    requestData.studentName || "Student Name";

  document.getElementById("modalStudentDepartment").textContent =
    requestData.studentDepartment || "-";

  setListItems("modalRelevantCourses", requestData.relevantCourses);
  setListItems("modalResearchInterests", requestData.researchInterests);

  const projectsContainer = document.getElementById("modalStudentProjects");
  const otherProjects = requestData.otherProjects || [];

  if (otherProjects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="student-project-card">
        <div class="student-project-header">
          <h4>No other projects</h4>
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

  projectsContainer.innerHTML = "";

  otherProjects.forEach(project => {
    const card = document.createElement("div");
    card.className = "student-project-card";

    card.innerHTML = `
      <div class="student-project-header">
        <h4>${project.title || "-"}</h4>
        <span class="student-project-badge ${getProjectBadgeClass(project.projectType)}">
          ${project.projectType || "PROJECT"}
        </span>
      </div>

      <div class="student-project-body">
        <p><strong>Project:</strong> ${project.role || "-"}</p>
      </div>

      <div class="student-project-footer">
        <p><strong>Skills:</strong> ${project.skills || "-"}</p>
      </div>
    `;

    projectsContainer.appendChild(card);
  });
}

function setListItems(listId, items) {
  const list = document.getElementById(listId);

  if (!items || items.length === 0) {
    list.innerHTML = `<li>No data</li>`;
    return;
  }

  list.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function getProjectBadgeClass(type) {
  const value = String(type || "").toUpperCase();

  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";
  if (value.includes("TEKNOFEST")) return "teknofest";

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
    /*
      Muhtemel endpoint:
      PUT /api/student-requests/{id}/response
      body: { status: "accepted" } veya { status: "rejected" }
    */
    const response = await fetch(`${API_BASE}/api/student-requests/${currentStudentRequest.id}/response`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: status.toUpperCase()
      })
    });

    if (!response.ok) {
      alert("Failed to update student request.");
      return;
    }

    if (status === "accepted") {
      actions.innerHTML = `
        <div class="student-request-final accepted">
          Accepted
        </div>
      `;
    } else {
      actions.innerHTML = `
        <div class="student-request-final rejected">
          Rejected
        </div>
      `;
    }

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}