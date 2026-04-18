const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupSaveButton();
  setupSkillAdder();

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
});

function setupDropdown() {
  const box = document.getElementById("studentProfileEditUserBox");
  const dropdown = document.getElementById("studentProfileEditDropdown");

  if (!box || !dropdown) return;

  box.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
    if (!box.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("studentProfileEditLogoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

function setupSaveButton() {
  const saveBtn = document.getElementById("studentSaveBtn");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", function () {
    alert("Student update endpoint is not connected yet. The form is now showing real data only.");
  });
}

function setupSkillAdder() {
  const addBtn = document.getElementById("studentAddSkillBtn");
  const container = document.getElementById("studentSkillsContainer");

  if (!addBtn || !container) return;

  addBtn.addEventListener("click", function () {
    const noSkillText = container.querySelector(".student-no-skill-text");
    if (noSkillText) {
      container.innerHTML = "";
    }

    const tag = document.createElement("span");
    tag.contentEditable = "true";
    tag.textContent = "New Skill";
    container.appendChild(tag);
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
    console.log("STUDENT PROFILE STATUS:", response.status);
    console.log("STUDENT PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert(`Failed to load student profile. Status: ${response.status}`);
      return;
    }

    const result = JSON.parse(text);

    if (!result.success || !result.data) {
      alert(result.message || "Failed to load student profile.");
      return;
    }

    const student = result.data;
    const firstName = student.firstName || "";
    const lastName = student.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById("studentTopName").textContent = fullName || "Student";
    document.getElementById("studentDisplayName").textContent = fullName || "Student";

    document.getElementById("studentDepartment").value = student.department || "";
    document.getElementById("studentYear").value = student.year ?? "";
    document.getElementById("studentEmail").value = student.email || "";
    document.getElementById("studentInterests").value =
      student.interests || student.researchInterests || "";
    document.getElementById("studentGithub").value = student.githubLink || "";
    document.getElementById("studentLinkedin").value = student.linkedinLink || "";
    document.getElementById("studentBio").value = student.shortBio || student.bio || "";

    renderSkills(student.skills);

  } catch (error) {
    console.error("Student edit profile load error:", error);
    alert("Server error while loading student profile.");
  }
}

function renderSkills(skillsValue) {
  const container = document.getElementById("studentSkillsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!skillsValue) {
    container.innerHTML = `<span class="student-no-skill-text">No skills found.</span>`;
    return;
  }

  const skills = String(skillsValue)
    .split(",")
    .map(skill => skill.trim())
    .filter(Boolean);

  if (!skills.length) {
    container.innerHTML = `<span class="student-no-skill-text">No skills found.</span>`;
    return;
  }

  skills.forEach(skill => {
    const span = document.createElement("span");
    span.textContent = skill;
    container.appendChild(span);
  });
}