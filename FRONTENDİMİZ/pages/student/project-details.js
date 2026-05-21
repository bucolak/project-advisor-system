const API_BASE = "https://project-advisor-system-production.up.railway.app";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("projectId");

  if (!projectId) {
    alert("Project id not found.");
    return;
  }

  await loadProjectDetails(token, projectId);
});

async function loadProjectDetails(token, projectId) {
  try {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("PROJECT DETAILS STATUS:", response.status);
    console.log("PROJECT DETAILS RESPONSE:", text);

    if (!response.ok) {
      alert("Project details could not be loaded.");
      return;
    }

    const result = JSON.parse(text);
    const project = result.data || result;

    renderProjectDetails(project);

  } catch (error) {
    console.error("Project details load error:", error);
    alert("Server error while loading project details.");
  }
}

function renderProjectDetails(project) {
  const categoryName =
    project.category?.name ||
    project.categoryName ||
    "PROJECT";

  const student = project.student;
  const user = student?.user;

  const studentName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Student Name";

  

  document.getElementById("detailsPageTitle").textContent =
    `${project.title || "Project"} Details`;

  document.getElementById("projectTitle").textContent =
    project.title || "-";

  document.getElementById("projectSkills").textContent =
    project.requiredSkills || "-";

  document.getElementById("projectDescription").textContent =
    project.description || "-";

  document.getElementById("projectRoles").textContent =
    project.rolesNeeded || "-";

  document.getElementById("projectTeamSize").textContent =
    project.teamSize || "-";

  document.getElementById("studentName").textContent =
    studentName || "Student Name";

  document.getElementById("studentDepartment").textContent =
    student?.department || "-";

  document.getElementById("studentEmail").textContent =
    `Email: ${user?.email || "-"}`;

  document.getElementById("studentYear").textContent =
    student?.year || "-";

  document.getElementById("studentGpa").textContent =
    student?.gpa || "-";

  document.getElementById("studentSkills").textContent =
    student?.skills || "-";

  document.getElementById("studentGithub").textContent =
    student?.githubLink || "-";

  document.getElementById("studentLinkedin").textContent =
    student?.linkedinLink || "-";
}
const backBtn = document.getElementById("backHomeBtn");

if (backBtn) {

  backBtn.addEventListener("click", function () {

    const role = localStorage.getItem("role");

    if (role === "STUDENT") {

      window.location.href = "../student/st-home.html";

    } else if (role === "ADVISOR") {

      window.location.href = "../advisor/ins-home.html";

    } else {

      window.location.href = "../../index.html";

    }

  });

}