const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
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
  await loadStudentProjects(token);
});

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

    renderTopbar("topbarArea", fullName || "Student", "Student");

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

     createdProjects.sort((a, b) => {
     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
});

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

function getBadgeClass(name) {
  const value = String(name || "").toUpperCase();

  if (value.includes("TUBITAK") || value.includes("TÜBİTAK")) {
    return "tubitak";
  }

  if (value.includes("TEKNOFEST")) {
    return "teknofest";
  }

  if (value.includes("COURSE")) {
    return "course";
  }

  const customClasses = [
    "custom-1",
    "custom-2",
    "custom-3",
    "custom-4",
    "custom-5"
  ];

  let total = 0;

  for (let i = 0; i < value.length; i++) {
    total += value.charCodeAt(i);
  }

  return customClasses[total % customClasses.length];
}