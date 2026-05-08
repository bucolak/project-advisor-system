const API_BASE = "http://localhost:8080";

let allOpenProjects = [];
let myApplications = [];

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
  await loadMyAdvisors(token);
  
await loadProjectCategoryFilter(token);
await loadOpenProjects(token);
setupProjectCategoryFilter();
await loadAnnouncements(token);
});

async function loadStudentProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert(`Failed to load student data. Status: ${response.status}`);
      return;
    }

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Failed to load student data.");
      return;
    }

    const profile = result.data;

    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    renderTopbar("topbarArea", fullName || "Student", "Student");

    const topProfileName = document.getElementById("topProfileName");
    const topProfileRole = document.getElementById("topProfileRole");
    const welcomeText = document.getElementById("welcomeText");
    const studentDepartment = document.getElementById("studentDepartment");
    const studentYear = document.getElementById("studentYear");

    if (topProfileName) topProfileName.textContent = fullName || "Student";
    if (topProfileRole) topProfileRole.textContent = "Student";
    if (welcomeText) welcomeText.textContent = `Welcome, ${firstName || "Student"} 👋`;
    if (studentDepartment) studentDepartment.textContent = profile.department || "-";
    if (studentYear) studentYear.textContent = profile.year ?? "-";

  } catch (error) {
    console.error("Student home load error:", error);
    alert("Server error while loading home page.");
  }
}

async function loadProjectCategoryFilter(token) {
  const filter = document.getElementById("projectCategoryFilter");

  if (!filter) return;

  try {
    const response = await fetch(`${API_BASE}/api/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const categories = result.data || result || [];

    filter.innerHTML = `<option value="ALL">All</option>`;

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = String(category.name || "").toUpperCase();
      option.textContent = category.name || "-";
      filter.appendChild(option);
    });

  } catch (error) {
    console.error("Category filter load error:", error);
  }
}

function setupProjectCategoryFilter() {
  const filter = document.getElementById("projectCategoryFilter");

  if (!filter) return;

  filter.addEventListener("change", function () {
    renderOpenProjectsByFilter(this.value);
  });
}

function renderOpenProjectsByFilter(selectedCategory) {
  if (selectedCategory === "ALL") {
    renderOpenProjects(allOpenProjects);
    return;
  }

  const filteredProjects = allOpenProjects.filter(project => {
    const categoryName = String(
      project.category?.name ||
      project.categoryName ||
      project.projectType ||
      "PROJECT"
    ).toUpperCase();

    return categoryName === selectedCategory;
  });

  renderOpenProjects(filteredProjects);
}

async function loadOpenProjects(token) {
  const container = document.getElementById("openProjectsList");

  try {
    const [projectsResponse, applicationsResponse] = await Promise.all([
  fetch(`${API_BASE}/api/projects/open`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  fetch(`${API_BASE}/api/projects/my-applications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
]);

const text = await projectsResponse.text();

    if (!projectsResponse.ok) {
      container.innerHTML = `
        <div class="project-card">
          <h4>Could not load open projects</h4>
          <p>Please check backend endpoint.</p>
        </div>
      `;
      return;
    }

    const applicationsResult = applicationsResponse.ok
  ? await applicationsResponse.json()
  : { data: [] };

myApplications = applicationsResult.data || [];

  const result = JSON.parse(text);
const projects = result.data || result || [];

projects.sort((a, b) => {
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
});

allOpenProjects = projects;

renderOpenProjects(allOpenProjects);

  } catch (error) {
    console.error("Open projects load error:", error);

    container.innerHTML = `
      <div class="project-card">
        <h4>Server error</h4>
        <p>Could not load open projects.</p>
      </div>
    `;
  }
}

function renderOpenProjects(projects) {
  const container = document.getElementById("openProjectsList");

  if (!container) return;

  if (!projects || !projects.length) {
    container.innerHTML = `
      <div class="project-card">
        <h4>No open projects yet</h4>
        <p>No project found for this filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  projects.forEach(project => {
    const categoryName =
      project.category?.name ||
      project.categoryName ||
      project.projectType ||
      "PROJECT";
      const badgeClass = getBadgeClass(categoryName);

    const studentName =
      project.student?.user
        ? `${project.student.user.firstName || ""} ${project.student.user.lastName || ""}`.trim()
        : "Student";

    const card = document.createElement("div");
    card.className = "project-card";

    const application = myApplications.find(app =>
  String(app.project?.id || app.projectId) === String(project.id)
);

const applicationStatus = String(application?.status || "").toUpperCase();

let applyButtonHtml = `
  <button type="button" class="open-project-apply-btn">
    Apply
  </button>
`;

if (applicationStatus === "PENDING") {
  applyButtonHtml = `
    <button
      type="button"
      class="open-project-apply-btn"
      disabled
      style="background:#999;"
    >
      Applied
    </button>
  `;
}

if (applicationStatus === "ACCEPTED") {
  applyButtonHtml = `
    <button
      type="button"
      class="open-project-apply-btn"
      disabled
      style="background:#20b14b;"
    >
      Applied
    </button>
  `;
}

if (applicationStatus === "REJECTED") {
  applyButtonHtml = `
    <button
      type="button"
      class="open-project-apply-btn"
      disabled
      style="background:#e53935;"
    >
      Applied
    </button>
  `;
}

    card.innerHTML = `
      <h4>${project.title || "Untitled Project"}</h4>
      <p><strong>Owner:</strong> ${studentName}</p>
      <p>
  <strong>Category:</strong>
  ${categoryName}
</p>
      <p>${project.description || "No description available."}</p>
      <p><strong>Skills:</strong> ${project.requiredSkills || "-"}</p>
      <p><strong>Team Size:</strong> ${project.teamSize || "-"}</p>

      <div class="open-project-actions">
        <button type="button" class="open-project-view-btn">
          View Details
        </button>

        ${applyButtonHtml}
      </div>
    `;

    card.querySelector(".open-project-view-btn").addEventListener("click", function () {
      window.location.href = `../student/project-details.html?projectId=${project.id}`;
    });

    const applyBtn = card.querySelector(".open-project-apply-btn");

if (!applyBtn.disabled) {
  applyBtn.addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    await applyToProject(project.id, token, this);
  });
}

    container.appendChild(card);
  });
}

async function applyToProject(projectId, token, button) {
  try {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/apply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("APPLY STATUS:", response.status);
    console.log("APPLY RESPONSE:", text);

    if (!response.ok) {
      alert("Application failed. You may have already applied.");
      return;
    }

    alert("Application sent successfully!");

button.textContent = "Applied";
button.disabled = true;
button.style.background = "#999";
button.style.cursor = "not-allowed";
button.style.opacity = "0.8";

  } catch (error) {
    console.error("Apply error:", error);
    alert("Server error while applying.");
  }
}

async function loadAnnouncements(token) {
  const list = document.getElementById("announcementsList");

  if (!list) return;

  try {
    const response = await fetch(`${API_BASE}/api/announcements/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("STUDENT ANNOUNCEMENTS STATUS:", response.status);
    console.log("STUDENT ANNOUNCEMENTS RESPONSE:", text);

    if (!response.ok) {
      list.innerHTML = `<li>Announcements could not be loaded.</li>`;
      return;
    }

    const result = JSON.parse(text);
    const announcements = result.data || result || [];

    if (!announcements.length) {
      list.innerHTML = `<li>No announcements yet.</li>`;
      return;
    }

    announcements.sort((a, b) => {
      const aId = Number(a.id || 0);
      const bId = Number(b.id || 0);

      return bId - aId;
    });

    list.innerHTML = "";

    announcements.slice(0, 3).forEach(item => {

      const parsed = parseAnnouncementContent(item.content || "");

      const deadlineValue = item.deadline || parsed.deadline;

      const deadline = deadlineValue
        ? ` - ${formatAnnouncementDate(deadlineValue)}`
        : "";

      const li = document.createElement("li");
li.className = "student-announcement-item";

li.innerHTML = `
  <strong>${item.title || "Announcement"}</strong>
  ${deadline}
`;

li.addEventListener("click", function () {
  openAnnouncementModal(item);
});

list.appendChild(li);
    });

  } catch (error) {
    console.error("Student announcements load error:", error);

    list.innerHTML = `<li>Server error while loading announcements.</li>`;
  }
}

function parseAnnouncementContent(text) {

  const parsed = {
    category: "",
    type: "",
    deadline: "",
    description: ""
  };

  if (!text) return parsed;

  const lines = String(text).split("\n");

  lines.forEach(line => {

    const clean = line.trim();

    if (clean.toLowerCase().startsWith("category:")) {
      parsed.category = clean.replace(/category:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("type:")) {
      parsed.type = clean.replace(/type:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("deadline:")) {
      parsed.deadline = clean.replace(/deadline:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("description:")) {
      parsed.description = clean.replace(/description:/i, "").trim();
    }
  });

  return parsed;
}
function openAnnouncementModal(item) {
  const parsed = parseAnnouncementContent(item.content || item.description || "");

  document.getElementById("modalAnnouncementTitle").textContent =
    item.title || "Announcement";

  document.getElementById("modalAnnouncementCategory").textContent =
    item.category || parsed.category || "-";

  document.getElementById("modalAnnouncementType").textContent =
    item.type || parsed.type || "-";

  const deadlineValue = item.deadline || parsed.deadline;

  document.getElementById("modalAnnouncementDeadline").textContent =
    deadlineValue ? formatAnnouncementDate(deadlineValue) : "-";

  document.getElementById("modalAnnouncementDescription").textContent =
    parsed.description || "-";

  document.getElementById("announcementModal").classList.add("show");
}

document.addEventListener("click", function (e) {
  const modal = document.getElementById("announcementModal");
  const closeBtn = document.getElementById("closeAnnouncementModal");

  if (!modal) return;

  if (e.target === modal || e.target === closeBtn) {
    modal.classList.remove("show");
  }
});
function formatAnnouncementDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
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

async function loadMyAdvisors(token) {
  const container = document.getElementById("myAdvisorsList");

  if (!container) return;

  container.innerHTML = `<p>Loading advisors...</p>`;

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/my-advisors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      container.innerHTML = `<p>Advisor data could not be loaded.</p>`;
      return;
    }

    const result = await response.json();
    const advisors = result.data || [];

    if (!advisors.length) {
      container.innerHTML = `<p>No advisor data yet.</p>`;
      return;
    }

    container.innerHTML = "";

    advisors.forEach(item => {
      const advisorBox = document.createElement("div");
      advisorBox.className = "student-home-advisor-item";

      const projects = item.projects || [];

      advisorBox.innerHTML = `
        <div class="student-home-advisor-icon">
          <i class="fa-regular fa-circle-user"></i>
        </div>

        <div class="student-home-advisor-info">
          <h4>${item.advisorName || "Advisor"}</h4>

          <ul>
            ${
              projects.length
                ? projects.map(p => `<li>${p}</li>`).join("")
                : `<li>No project data</li>`
            }
          </ul>
        </div>
      `;

      container.appendChild(advisorBox);
    });

  } catch (error) {
    console.error("My advisors load error:", error);
    container.innerHTML = `<p>Server error while loading advisors.</p>`;
  }
}