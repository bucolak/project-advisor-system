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

  await loadStudentProfile(token, userId);
  await loadOpenProjects(token);
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

    if (!projects.length) {
      container.innerHTML = `
        <div class="project-card">
          <h4>No open projects yet</h4>
          <p>Other students' projects will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    projects.forEach(project => {
      const categoryName =
        project.category?.name ||
        project.categoryName ||
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
        window.location.href = `../common/project-details.html?projectId=${project.id}`;
      });

      card.querySelector(".open-project-apply-btn").addEventListener("click", async function () {
        try {
          const response = await fetch(`${API_BASE}/api/projects/${project.id}/apply`, {
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

          this.textContent = "Applied";
          this.disabled = true;

        } catch (error) {
          console.error("Apply error:", error);
          alert("Server error while applying.");
        }
      });

      container.appendChild(card);
    });

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