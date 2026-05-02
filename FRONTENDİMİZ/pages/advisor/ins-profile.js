const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADVISOR") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdvisorProfile(token, userId);
});

function setupDropdown() {
  const userBox = document.getElementById("advisorUserBox");
  const dropdown = document.getElementById("profileDropdown");

  if (!userBox || !dropdown) return;

  userBox.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
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

async function loadAdvisorProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

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
    const fullName = `Dr. ${`${firstName} ${lastName}`.trim()}`.trim();

    document.getElementById("advisorTopName").textContent = fullName;
    document.getElementById("advisorProfileName").textContent = fullName;
    document.getElementById("advisorDepartment").textContent = advisor.department || "-";
    document.getElementById("advisorTitle").textContent = advisor.title || "-";
    document.getElementById("advisorEmail").textContent = advisor.email || "-";

    renderExpertise(advisor.areasOfExpertise);
    renderResearch(advisor.researchInterests);

    await loadPreviouslySupervisedProjectTypes(token);

    const savedStatus = localStorage.getItem("advisorStatus");
    renderStatus(savedStatus || advisor.advisingStatus);

  } catch (error) {
    console.error("Advisor profile load error:", error);
    alert("Server error while loading advisor profile.");
  }
}

async function loadPreviouslySupervisedProjectTypes(token) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors/my-students`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      renderProjectTypes([]);
      return;
    }

    const result = JSON.parse(text);
    const projects = result.data || result || [];

    const projectTypes = projects
      .map(item =>
        item.projectType ||
        item.category ||
        item.categoryName ||
        item.projectCategory ||
        "PROJECT"
      )
      .filter(Boolean);

    const uniqueTypes = [...new Set(projectTypes)];

    renderProjectTypes(uniqueTypes);

  } catch (error) {
    console.error("Previously supervised project types load error:", error);
    renderProjectTypes([]);
  }
}

function renderExpertise(expertiseValue) {
  const container = document.getElementById("advisorExpertiseTags");
  container.innerHTML = "";

  if (!expertiseValue) {
    container.innerHTML = "<span>No expertise found</span>";
    return;
  }

  const expertiseList = String(expertiseValue)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  if (!expertiseList.length) {
    container.innerHTML = "<span>No expertise found</span>";
    return;
  }

  expertiseList.forEach(item => {
    const span = document.createElement("span");
    span.textContent = item;
    container.appendChild(span);
  });
}

function renderResearch(researchValue) {
  const container = document.getElementById("advisorResearchList");
  container.innerHTML = "";

  if (!researchValue) {
    container.innerHTML = "<li>No research interests found</li>";
    return;
  }

  let researchList = [];

  if (Array.isArray(researchValue)) {
    researchList = researchValue;
  } else {
    researchList = String(researchValue)
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (!researchList.length) {
    container.innerHTML = "<li>No research interests found</li>";
    return;
  }

  researchList.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderProjectTypes(projectTypesValue) {
  const container = document.getElementById("advisorProjectTypes");
  container.innerHTML = "";

  if (!projectTypesValue || !projectTypesValue.length) {
    container.innerHTML = `
      <div class="project-type-row">
        <span class="type-badge tubitak">-</span>
        <span class="type-text">No data</span>
      </div>
    `;
    return;
  }

  let projectTypes = [];

  if (Array.isArray(projectTypesValue)) {
    projectTypes = projectTypesValue;
  } else {
    projectTypes = String(projectTypesValue)
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (!projectTypes.length) {
    container.innerHTML = `
      <div class="project-type-row">
        <span class="type-badge tubitak">-</span>
        <span class="type-text">No data</span>
      </div>
    `;
    return;
  }

  projectTypes.forEach(type => {
    const badgeClass = getProjectTypeBadgeClass(type);

    const row = document.createElement("div");
    row.className = "project-type-row";
    row.innerHTML = `
      <span class="type-badge ${badgeClass}">${type}</span>
      <span class="type-text">Projects</span>
    `;
    container.appendChild(row);
  });
}

function renderStatus(status) {
  const normalized = String(status || "").toUpperCase();
  const inlineText = document.getElementById("advisorStatusTextInline");
  const dot = document.getElementById("advisorStatusDot");
  const cardText = document.getElementById("advisorStatusCardText");
  const button = document.getElementById("advisorStatusButton");

  if (normalized === "ACTIVE") {
    inlineText.textContent = "Active";
    cardText.innerHTML = "You are currently available<br />for advising students";
    button.textContent = "Active";
    button.classList.remove("inactive");
    dot.style.backgroundColor = "#2ecc71";
  } else {
    inlineText.textContent = "Inactive";
    cardText.innerHTML = "You are currently unavailable<br />for advising students";
    button.textContent = "Inactive";
    button.classList.add("inactive");
    dot.style.backgroundColor = "#e74c3c";
  }
}

function getProjectTypeBadgeClass(type) {
  const value = String(type || "").toUpperCase();

  if (value.includes("TEKNOFEST")) return "teknofest";
  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";
  if (value.includes("COURSE")) return "course";

  return "tubitak";
}