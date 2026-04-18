const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  console.log("TOKEN:", token);
  console.log("USER ID:", userId);
  console.log("ROLE:", role);

  if (!token || !userId || role !== "ADVISOR") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdvisorInfo(token, userId);
  await loadAdvisorStudents(token);
  await loadPendingRequests(token);
});

function setupDropdown() {
  const userBox = document.getElementById("advisorUserBox");
  const dropdown = document.getElementById("profileDropdown");

  if (!userBox || !dropdown) return;

  userBox.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (!userBox.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("advisorLogoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

async function loadAdvisorInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors/${userId}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("ADVISOR PROFILE STATUS:", response.status);
    console.log("ADVISOR PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert(`Failed to load advisor profile. Status: ${response.status}`);
      return;
    }

    const result = JSON.parse(text);

    if (!result.success || !result.data) {
      alert(result.message || "Failed to load advisor profile.");
      return;
    }

    const advisor = result.data;

    const firstName = advisor.firstName || "";
    const lastName = advisor.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById("advisorTopName").textContent = `Dr. ${fullName}`;
    document.getElementById("advisorWelcomeText").textContent =
      `Welcome, Dr. ${firstName} 👋`;
    document.getElementById("advisorDepartment").textContent =
      advisor.department || "-";
    document.getElementById("advisorTitle").textContent =
      advisor.title || "-";

    setAdvisorStatus(advisor.advisingStatus || "ACTIVE");

  } catch (error) {
    console.error("Advisor info load error:", error);
    alert("Server error while loading advisor info.");
  }
}

function setAdvisorStatus(status) {
  const activeBtn = document.getElementById("advisorActiveBtn");
  const inactiveBtn = document.getElementById("advisorInactiveBtn");
  const statusText = document.getElementById("statusText");

  if (!activeBtn || !inactiveBtn || !statusText) return;

  activeBtn.classList.remove("selected");
  inactiveBtn.classList.remove("selected");

  const currentStatus = String(status).toUpperCase();

  if (currentStatus === "ACTIVE") {
    activeBtn.classList.add("selected");
    statusText.textContent = "You are currently available for advising students";
  } else {
    inactiveBtn.classList.add("selected");
    statusText.textContent = "You are currently unavailable for advising students";
  }
}

async function loadAdvisorStudents(token) {
  const container = document.getElementById("advisorProjectsContainer");

  try {
    const response = await fetch(`${API_BASE}/api/advisors/my-students`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("MY STUDENTS STATUS:", response.status);
    console.log("MY STUDENTS RESPONSE:", text);

    if (!response.ok) {
      container.innerHTML = `
        <div class="project-card">
          <h4>Could not load projects</h4>
          <p>Please check backend response.</p>
        </div>
      `;
      return;
    }

    const result = JSON.parse(text);
    const students = result.data || result || [];

    if (!students.length) {
      container.innerHTML = `
        <div class="project-card">
          <h4>No projects yet</h4>
          <p>Advisor projects will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    students.forEach(student => {
      const card = document.createElement("div");
      card.className = "project-card";

      const studentName =
        student.studentName ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Student";

      card.innerHTML = `
        <h4>${student.projectTitle || "Student Project"} <span class="tag red">${student.projectType || "PROJECT"}</span></h4>
        <p>Student: ${studentName}</p>
        <p>Department: ${student.department || "-"}</p>
        <p>Skills: ${student.skills || "-"}</p>
        <a href="#" class="view-details-btn">View Details</a>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Advisor students load error:", error);
    container.innerHTML = `
      <div class="project-card">
        <h4>Server error</h4>
        <p>Projects could not be loaded.</p>
      </div>
    `;
  }
}

async function loadPendingRequests(token) {
  const announcementsContainer = document.getElementById("advisorAnnouncementsList");

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/pending`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("PENDING REQUESTS STATUS:", response.status);
    console.log("PENDING REQUESTS RESPONSE:", text);

    if (!response.ok) {
      announcementsContainer.innerHTML = `
        <div class="ann-item">
          <i class="fa-solid fa-thumbtack"></i> No announcements found.
        </div>
      `;
      return;
    }

    const result = JSON.parse(text);
    const requests = result.data || result || [];

    if (!requests.length) {
      announcementsContainer.innerHTML = `
        <div class="ann-item">
          <i class="fa-solid fa-thumbtack"></i> No pending advisor requests.
        </div>
      `;
      return;
    }

    announcementsContainer.innerHTML = "";

    requests.slice(0, 3).forEach(item => {
      const div = document.createElement("div");
      div.className = "ann-item";
      div.innerHTML = `
        <i class="fa-solid fa-thumbtack"></i>
        Pending request: ${item.studentName || "Student"} - ${item.projectTitle || "Project"}
      `;
      announcementsContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Pending requests load error:", error);
    announcementsContainer.innerHTML = `
      <div class="ann-item">
        <i class="fa-solid fa-thumbtack"></i> Server error while loading requests.
      </div>
    `;
  }
}