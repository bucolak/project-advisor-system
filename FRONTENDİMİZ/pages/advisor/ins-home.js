const API_BASE = "http://localhost:8080";

let advisorProjectCount = 0;
let currentAdvisorStatus = "ACTIVE";

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupStatusButtons();

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
  renderSidebar(role);
  await loadAdvisorInfo(token, userId);
  await loadAdvisorStudents(token);
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

function setupStatusButtons() {
  const activeBtn = document.getElementById("advisorActiveBtn");
  const inactiveBtn = document.getElementById("advisorInactiveBtn");

  if (!activeBtn || !inactiveBtn) return;

  activeBtn.addEventListener("click", function () {
    setAdvisorStatus("ACTIVE");
  });

  inactiveBtn.addEventListener("click", function () {
    if (advisorProjectCount < 5) {
      alert("You cannot become inactive yet. You must have 5 projects first.");
      return;
    }

    setAdvisorStatus("INACTIVE");
  });
}

async function loadAdvisorInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
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

    renderTopbar("topbarArea", fullName || "Advisor", "Advisor");

    const advisorTopName = document.getElementById("advisorTopName");
    const advisorWelcomeText = document.getElementById("advisorWelcomeText");
    const advisorDepartment = document.getElementById("advisorDepartment");
    const advisorTitle = document.getElementById("advisorTitle");

    if (advisorTopName) advisorTopName.textContent = `Dr. ${fullName || "Advisor"}`;

    if (advisorWelcomeText) {
      advisorWelcomeText.textContent = `Welcome, Dr. ${firstName || "Advisor"} 👋`;
    }

    if (advisorDepartment) {
      advisorDepartment.textContent = advisor.department || "-";
    }

    if (advisorTitle) {
      advisorTitle.textContent = advisor.title || "-";
    }

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

  currentAdvisorStatus = String(status).toUpperCase();
  localStorage.setItem("advisorStatus", currentAdvisorStatus);

  if (currentAdvisorStatus === "ACTIVE") {
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
        Authorization: `Bearer ${token}`
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
      advisorProjectCount = 0;
      return;
    }

    const result = JSON.parse(text);
    const students = result.data || result || [];

    advisorProjectCount = students.length;

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
        <h4>
          ${student.projectTitle || "Student Project"}
          <span class="tag red">${student.projectType || "PROJECT"}</span>
        </h4>

        <p>Student: ${studentName}</p>
        <p>Department: ${student.department || "-"}</p>
        <p>Skills: ${student.skills || "-"}</p>

        <a href="#" class="view-details-btn" data-project-id="${student.projectId}">
          View Details
        </a>
      `;

      card.querySelector(".view-details-btn").addEventListener("click", function (e) {
        e.preventDefault();

        const projectId = this.dataset.projectId;

        if (!projectId || projectId === "undefined") {
          alert("Project id not found.");
          return;
        }

        window.location.href = `../advisor/project-details1.html?projectId=${projectId}`;
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Advisor students load error:", error);

    advisorProjectCount = 0;

    container.innerHTML = `
      <div class="project-card">
        <h4>Server error</h4>
        <p>Projects could not be loaded.</p>
      </div>
    `;
  }
}