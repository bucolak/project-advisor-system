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

    const fullName =
      `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Student";

    renderTopbar("topbarArea", fullName, "Student");

  } catch (error) {
    console.error("Student profile load error:", error);
  }
}

async function loadNotifications(token) {
  renderNoNotifications();
}

function renderNoNotifications() {
  const list = document.getElementById("notificationsList");
  const count = document.getElementById("notificationsNewCount");

  if (count) count.textContent = "0 New";

  if (list) {
    list.innerHTML = `
      <div class="notification-item no-notification-box">
        <i class="fa-regular fa-circle-user"></i>
        <span>No new notifications.</span>
      </div>
    `;
  }
}

async function loadIncomingStudentRequest(token) {
  const card = document.getElementById("studentRequestCard");
  const list = document.getElementById("notificationsList");
  const count = document.getElementById("notificationsNewCount");

  try {
    const response = await fetch(`${API_BASE}/api/projects/incoming-applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      card.style.display = "none";
      renderNoNotifications();
      return;
    }

    const result = await response.json();
    const requests = result.data || [];

    if (!requests.length) {
      card.style.display = "none";
      renderNoNotifications();
      return;
    }

    currentStudentRequest = requests[0];

    list.innerHTML = "";
    count.textContent = `${requests.length} New`;

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
      count.textContent = "0 New";
    } else if (status === "REJECTED") {
      actions.innerHTML = `<div class="student-request-final rejected">Rejected</div>`;
      count.textContent = "0 New";
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
    }

    fillStudentProfileModal(currentStudentRequest);

  } catch (error) {
    console.error("Incoming student request load error:", error);
    card.style.display = "none";
    renderNoNotifications();
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
  const count = document.getElementById("notificationsNewCount");

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

    if (status === "ACCEPTED") {
      actions.innerHTML = `<div class="student-request-final accepted">Accepted</div>`;
    } else {
      actions.innerHTML = `<div class="student-request-final rejected">Rejected</div>`;
    }

    count.textContent = "0 New";

  } catch (error) {
    console.error("Student request response error:", error);
    alert("Server error while updating request.");
  }
}