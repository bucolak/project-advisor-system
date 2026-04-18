const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupUserDropdown();
  setupLogout();

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
  await loadStudentProjects(token, userId);
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
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("PROFILE STATUS:", response.status);
    console.log("RAW PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert(`Failed to load student profile. Status: ${response.status}`);
      return;
    }

    const result = JSON.parse(text);

    if (!result.success || !result.data) {
      alert(result.message || "Failed to load student profile.");
      return;
    }

    const profile = result.data;
    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

    document.getElementById("studentTopName").textContent = fullName || "Student";
    document.getElementById("studentTopRole").textContent = "Student";

  } catch (error) {
    console.error("Profile load error:", error);
    alert("Server error while loading profile.");
  }
}

async function loadStudentProjects(token, userId) {
  try {
    /*
      Buradaki endpointleri backend'inizdeki gerçek endpointlere göre ayarlayın.
      Şu an en olası tahmin endpointleri kullandım.
    */

    const joinedResponse = await fetch(`${API_BASE}/api/students/${userId}/joined-projects`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const createdResponse = await fetch(`${API_BASE}/api/students/${userId}/created-projects`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const joinedText = await joinedResponse.text();
    const createdText = await createdResponse.text();

    console.log("JOINED PROJECTS STATUS:", joinedResponse.status);
    console.log("JOINED PROJECTS RESPONSE:", joinedText);

    console.log("CREATED PROJECTS STATUS:", createdResponse.status);
    console.log("CREATED PROJECTS RESPONSE:", createdText);

    if (joinedResponse.ok) {
      const joinedResult = JSON.parse(joinedText);
      renderProjects("joinedProjectsContainer", joinedResult.data || [], false);
    } else {
      renderEmptyProjects("joinedProjectsContainer", "No joined projects yet.");
    }

    if (createdResponse.ok) {
      const createdResult = JSON.parse(createdText);
      renderProjects("createdProjectsContainer", createdResult.data || [], true);
    } else {
      renderEmptyProjects("createdProjectsContainer", "No created projects yet.");
    }

  } catch (error) {
    console.error("Projects load error:", error);
    renderEmptyProjects("joinedProjectsContainer", "Could not load joined projects.");
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

    const badgeText = project.categoryName || project.projectType || "PROJECT";
    const badgeClass = getBadgeClass(badgeText);

    const advisorAssigned = project.advisorAssigned === true || project.advisorName;
    const advisorText = advisorAssigned
      ? `Advisor: ${project.advisorName || "Assigned"}`
      : "Advisor: Not assigned";

    card.innerHTML = `
      <div class="st-projects-card-header">
        <h3>${project.title || "Untitled Project"}</h3>
        <span class="st-projects-badge ${badgeClass}">${badgeText}</span>
      </div>

      <p>${project.description || "No description available."}</p>
      <div class="st-projects-line"></div>
      <p><strong>Skills:</strong> ${project.requiredSkills || project.skills || "-"}</p>
      <div class="st-projects-line"></div>
      <p><strong>Team:</strong> ${project.currentTeamSize ?? 0}/${project.teamSize ?? "-"}</p>

      <div class="st-projects-card-footer">
        <span class="${advisorAssigned ? "assigned" : "not-assigned"}">${advisorText}</span>
        <button type="button" data-project-id="${project.id}">View Details</button>
      </div>
    `;

    const viewButton = card.querySelector("button");
    viewButton.addEventListener("click", function () {
      alert(`Project detail page will open for project ID: ${project.id}`);
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
      <p>Projects will appear here when connected to backend.</p>
    </div>
  `;
}

function getBadgeClass(type) {
  const value = String(type).toUpperCase();

  if (value.includes("TÜBİTAK")) return "red";
  if (value.includes("TEKNOFEST")) return "orange";
  if (value.includes("COURSE")) return "yellow";
  if (value.includes("TUBITAK")) return "red";

  return "pink";
}