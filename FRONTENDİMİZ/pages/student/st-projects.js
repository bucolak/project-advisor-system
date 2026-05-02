const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupUserDropdown();
  setupLogout();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "STUDENT") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadStudentProfile(token, userId);
  await loadStudentProjects(token);
});

function setupUserDropdown() {
  const studentUserBox = document.getElementById("studentUserBox");
  const studentLogoutMenu = document.getElementById("studentLogoutMenu");
  const studentUserArrow = document.getElementById("studentUserArrow");

  if (!studentUserBox || !studentLogoutMenu || !studentUserArrow) return;

  studentUserBox.addEventListener("click", function (e) {
    e.stopPropagation();
    studentLogoutMenu.classList.toggle("show");
    studentUserArrow.classList.toggle("rotate");
  });

  document.addEventListener("click", function (e) {
    if (!studentUserBox.contains(e.target) && !studentLogoutMenu.contains(e.target)) {
      studentLogoutMenu.classList.remove("show");
      studentUserArrow.classList.remove("rotate");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

async function loadStudentProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();

    if (!result.success || !result.data) return;

    const profile = result.data;
    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

    document.getElementById("studentTopName").textContent = fullName || "Student";
    document.getElementById("studentTopRole").textContent = "Student";

  } catch (error) {
    console.error("Profile load error:", error);
  }
}

async function loadStudentProjects(token) {
  try {
    const joinedResponse = await fetch(`${API_BASE}/api/projects/joined-projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const createdResponse = await fetch(`${API_BASE}/api/projects/my-projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (joinedResponse.ok) {
      const joinedResult = await joinedResponse.json();
      const joinedApplications = joinedResult.data || [];
      renderJoinedProjects("joinedProjectsContainer", joinedApplications);
    } else {
      renderEmptyProjects("joinedProjectsContainer", "No joined projects yet.");
    }

    if (createdResponse.ok) {
      const createdResult = await createdResponse.json();
      const createdProjects = createdResult.data || [];
      renderProjects("createdProjectsContainer", createdProjects, true);
    } else {
      renderEmptyProjects("createdProjectsContainer", "No created projects yet.");
    }

  } catch (error) {
    console.error("Projects load error:", error);
    renderEmptyProjects("joinedProjectsContainer", "Could not load joined projects.");
    renderEmptyProjects("createdProjectsContainer", "Could not load created projects.");
  }
}

function renderJoinedProjects(containerId, applications) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!applications || applications.length === 0) {
    renderEmptyProjects(containerId, "No joined projects yet.");
    return;
  }

  container.innerHTML = "";

  applications.forEach(application => {
    const project = application.project;
    if (!project) return;

    const card = document.createElement("div");
    card.className = "st-projects-card";

    const categoryName =
      project.category?.name ||
      project.categoryName ||
      "PROJECT";

    const badgeClass = getBadgeClass(categoryName);

    const ownerName =
      project.student?.user
        ? `${project.student.user.firstName || ""} ${project.student.user.lastName || ""}`.trim()
        : "Student";

    card.innerHTML = `
      <div class="st-projects-card-header">
        <h3>${project.title || "Untitled Project"}</h3>
        <span class="st-projects-badge ${badgeClass}">${categoryName}</span>
      </div>

      <p>${project.description || "No description available."}</p>
      <div class="st-projects-line"></div>
      <p><strong>Owner:</strong> ${ownerName}</p>
      <div class="st-projects-line"></div>
      <p><strong>Skills:</strong> ${project.requiredSkills || "-"}</p>
      <div class="st-projects-line"></div>
      <p><strong>Team:</strong> ${project.teamSize ?? "-"}</p>

      <div class="st-projects-card-footer">
        <span class="assigned">Joined</span>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderProjects(containerId, projects, isCreatedSection) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!projects || projects.length === 0) {
    renderEmptyProjects(
      containerId,
      isCreatedSection ? "No created projects yet." : "No joined projects yet."
    );
    return;
  }

  container.innerHTML = "";

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "st-projects-card";

    const badgeText =
      project.category?.name ||
      project.categoryName ||
      project.projectType ||
      "PROJECT";

    const badgeClass = getBadgeClass(badgeText);

    card.innerHTML = `
      <div class="st-projects-card-header">
        <h3>${project.title || "Untitled Project"}</h3>
        <span class="st-projects-badge ${badgeClass}">${badgeText}</span>
      </div>

      <p>${project.description || "No description available."}</p>
      <div class="st-projects-line"></div>
      <p><strong>Skills:</strong> ${project.requiredSkills || project.skills || "-"}</p>
      <div class="st-projects-line"></div>
      <p><strong>Team:</strong> ${project.teamSize ?? "-"}</p>

      <div class="st-projects-card-footer">
        <span class="assigned">Created</span>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderEmptyProjects(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="st-projects-card">
      <div class="st-projects-card-header">
        <h3>${message}</h3>
      </div>
      <p>Projects will appear here.</p>
    </div>
  `;
}

function getBadgeClass(type) {
  const value = String(type).toUpperCase();

  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "red";
  if (value.includes("TEKNOFEST")) return "orange";
  if (value.includes("COURSE")) return "yellow";

  return "pink";
}