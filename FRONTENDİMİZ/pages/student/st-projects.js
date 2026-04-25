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
    const profile = result.data || result;

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

    document.getElementById("studentTopName").textContent = fullName || "Student";
    document.getElementById("studentTopRole").textContent = "Student";

  } catch (error) {
    console.error("Profile load error:", error);
  }
}

async function loadStudentProjects(token) {
  renderEmptyProjects("joinedProjectsContainer", "No joined projects yet.");

  try {
    const response = await fetch(`${API_BASE}/api/projects/my-projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("MY PROJECTS STATUS:", response.status);
    console.log("MY PROJECTS RESPONSE:", text);

    if (!response.ok) {
      renderEmptyProjects("createdProjectsContainer", "Could not load created projects.");
      return;
    }

    const result = JSON.parse(text);
    const projects = result.data || result || [];

    renderProjects("createdProjectsContainer", projects, true);

  } catch (error) {
    console.error("Projects load error:", error);
    renderEmptyProjects("createdProjectsContainer", "Could not load created projects.");
  }
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

    const categoryName =
      project.category?.name ||
      project.categoryName ||
      project.projectType ||
      "PROJECT";

    const badgeClass = getBadgeClass(categoryName);

    const advisorName =
      project.advisorName ||
      project.advisor?.fullName ||
      project.advisor?.name ||
      "";

    const advisorAssigned = Boolean(advisorName);

    card.innerHTML = `
      <div class="st-projects-card-header">
        <h3>${project.title || "Untitled Project"}</h3>
        <span class="st-projects-badge ${badgeClass}">${categoryName}</span>
      </div>

      <p>${project.description || "No description available."}</p>

      <div class="st-projects-line"></div>

      <p><strong>Skills:</strong> ${project.requiredSkills || project.skills || "-"}</p>

      <div class="st-projects-line"></div>

      <p><strong>Team:</strong> ${project.currentTeamSize ?? 1}/${project.teamSize ?? "-"}</p>

      <div class="st-projects-line"></div>

      <p><strong>Roles Needed:</strong> ${project.rolesNeeded || "-"}</p>

      <div class="st-projects-card-footer">
        <span class="${advisorAssigned ? "assigned" : "not-assigned"}">
          ${advisorAssigned ? `Advisor: ${advisorName}` : "Advisor: Not assigned"}
        </span>

        <button type="button" data-project-id="${project.id}">
          View Details
        </button>
      </div>
    `;

    const viewButton = card.querySelector("button");
    viewButton.addEventListener("click", function () {
      const projectId = this.dataset.projectId;
      alert(`Project detail page will open for project ID: ${projectId}`);
    });

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
  const value = String(type || "").toUpperCase();

  if (value.includes("TÜBİTAK")) return "red";
  if (value.includes("TUBITAK")) return "red";
  if (value.includes("TEKNOFEST")) return "orange";
  if (value.includes("COURSE")) return "yellow";

  return "pink";
}