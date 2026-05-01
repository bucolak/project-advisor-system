const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
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
});

function setupDropdown() {
  const box = document.getElementById("studentProfileUserBox");
  const dropdown = document.getElementById("studentProfileDropdown");

  if (!box || !dropdown) return;

  box.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
    if (!box.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("studentProfileLogoutBtn");

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

    const text = await response.text();

    if (!response.ok) {
      alert(`Failed to load profile. Status: ${response.status}`);
      return;
    }

    const result = JSON.parse(text);

    if (!result.success) {
      alert(result.message || "Failed to load profile.");
      return;
    }

    const profile = result.data;

    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById("topProfileName").textContent = fullName || "Student";
    document.getElementById("profileFullName").textContent = fullName || "Student";

    document.getElementById("profileDepartment").textContent = profile.department || "-";
    document.getElementById("profileYear").textContent = profile.year ?? "-";
    document.getElementById("profileEmail").textContent = profile.email || "-";

    document.getElementById("profileInterests").textContent =
      profile.interests || profile.researchInterests || "-";

    document.getElementById("profileGithub").textContent = profile.githubLink || "-";
    document.getElementById("profileLinkedin").textContent = profile.linkedinLink || "-";

    document.getElementById("profileBio").textContent =
      profile.shortBio || profile.bio || "No bio information.";

    renderSkills(profile.skills);

  } catch (error) {
    console.error("Profile load error:", error);
    alert("Server error while loading profile.");
  }
}

function renderSkills(skillsValue) {
  const skillsContainer = document.getElementById("profileSkills");

  if (!skillsContainer) return;

  skillsContainer.innerHTML = "";

  if (!skillsValue) {
    skillsContainer.innerHTML = `<span class="skill-tag">No skills found</span>`;
    return;
  }

  const skills = String(skillsValue)
    .split(",")
    .map(skill => skill.trim())
    .filter(Boolean);

  if (!skills.length) {
    skillsContainer.innerHTML = `<span class="skill-tag">No skills found</span>`;
    return;
  }

  skills.forEach(skill => {
    const span = document.createElement("span");
    span.className = "skill-tag";
    span.textContent = skill;
    skillsContainer.appendChild(span);
  });
}