const API_BASE = "http://localhost:8080";

let allOpenProjects = [];

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
    renderTopbar("topbarArea", fullName, "Student");
    document.getElementById("topProfileName").textContent = fullName || "Student";
    document.getElementById("topProfileRole").textContent = "Student";
    document.getElementById("welcomeText").textContent = `Welcome, ${firstName || "Student"} 👋`;
    document.getElementById("studentDepartment").textContent = profile.department || "-";
    document.getElementById("studentYear").textContent = profile.year ?? "-";

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
    const response = await fetch(`${API_BASE}/api/projects/open`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      container.innerHTML = `
        <div class="project-card">
          <h4>Could not load open projects</h4>
          <p>Please check backend endpoint.</p>
        </div>
      `;
      return;
    }

    const result = JSON.parse(text);
    const projects = result.data || result || [];

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

    const studentName =
      project.student?.user
        ? `${project.student.user.firstName || ""} ${project.student.user.lastName || ""}`.trim()
        : "Student";

    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
      <h4>${project.title || "Untitled Project"}</h4>
      <p><strong>Owner:</strong> ${studentName}</p>
      <p><strong>Category:</strong> ${categoryName}</p>
      <p>${project.description || "No description available."}</p>
      <p><strong>Skills:</strong> ${project.requiredSkills || "-"}</p>
      <p><strong>Team Size:</strong> ${project.teamSize || "-"}</p>

      <div class="open-project-actions">
        <button type="button" class="open-project-view-btn">
          View Details
        </button>

        <button type="button" class="open-project-apply-btn">
          Apply
        </button>
      </div>
    `;

    card.querySelector(".open-project-view-btn").addEventListener("click", function () {
      window.location.href = `../student/project-details.html?projectId=${project.id}`;
    });

    card.querySelector(".open-project-apply-btn").addEventListener("click", async function () {
      await applyToProject(project.id, token, this);
    });

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

  } catch (error) {
    console.error("Apply error:", error);
    alert("Server error while applying.");
  }
}

async function loadAnnouncements(token) {
  const list = document.getElementById("announcementsList");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements`, {
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

    list.innerHTML = "";

    announcements.slice(0, 3).forEach(item => {
      const li = document.createElement("li");

      const deadline = item.deadline
        ? ` - ${formatAnnouncementDate(item.deadline)}`
        : "";

      li.innerHTML = `
        <strong>${item.title || "Announcement"}</strong>
        ${deadline}
      `;

      list.appendChild(li);
    });

  } catch (error) {
    console.error("Student announcements load error:", error);
    list.innerHTML = `<li>Server error while loading announcements.</li>`;
  }
}

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