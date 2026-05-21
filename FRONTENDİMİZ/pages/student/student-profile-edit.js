const API_BASE = "https://project-advisor-system-production.up.railway.app";

document.addEventListener("DOMContentLoaded", async function () {
  setupSaveButton();

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
  setupSkillSelection();
});

function setupSkillSelection() {
  const skillTags = document.querySelectorAll("#studentSkillsContainer .skill-tag");

  skillTags.forEach(tag => {
    tag.onclick = function () {
      tag.classList.toggle("selected");
    };
  });
}

function setupSaveButton() {
  const saveBtn = document.getElementById("studentSaveBtn");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    await updateStudentProfile(token, userId);
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

    renderTopbar("topbarArea", fullName || "Student", "Student");

    document.getElementById("studentDisplayName").textContent = fullName || "Student";
   const departmentInput = document.getElementById("studentDepartment");
    departmentInput.value = student.department || "";
    departmentInput.readOnly = true;
    departmentInput.classList.add("readonly-field");
    const yearInput = document.getElementById("studentYear");
    yearInput.value = student.year ?? "";
    yearInput.readOnly = true;
    yearInput.classList.add("readonly-field");
    const gpaInput = document.getElementById("studentGpa");
gpaInput.value = student.gpa ?? "";
gpaInput.readOnly = true;
gpaInput.classList.add("readonly-field");
   const emailInput = document.getElementById("studentEmail");

  emailInput.value = student.email || "";

  emailInput.readOnly = true;

  emailInput.classList.add("readonly-field");
    document.getElementById("studentInterests").value =
      student.interests || student.researchInterests || "";
    document.getElementById("studentGithub").value = student.githubLink || "";
    document.getElementById("studentLinkedin").value = student.linkedinLink || "";
    document.getElementById("studentBio").value = student.shortBio || student.bio || "";

    markSelectedSkills(student.skills);

  } catch (error) {
    console.error("Student edit profile load error:", error);
    alert("Server error while loading student profile.");
  }
}

function markSelectedSkills(skillsValue) {
  document.querySelectorAll("#studentSkillsContainer .skill-tag").forEach(tag => {
    tag.classList.remove("selected");
  });

  if (!skillsValue) return;

  const selectedSkills = String(skillsValue)
    .split(",")
    .map(skill => skill.trim().toLowerCase())
    .filter(Boolean);

  document.querySelectorAll("#studentSkillsContainer .skill-tag").forEach(tag => {
    const skillName = String(tag.dataset.skill || tag.textContent)
      .trim()
      .toLowerCase();

    if (selectedSkills.includes(skillName)) {
      tag.classList.add("selected");
    }
  });
}

function getSelectedSkillsText() {
  const selectedSkills = Array.from(
    document.querySelectorAll("#studentSkillsContainer .skill-tag.selected")
  ).map(tag => String(tag.dataset.skill || tag.textContent).trim());

  return selectedSkills.join(", ");
}

async function updateStudentProfile(token, userId) {
  const payload = {

   
    interests: document.getElementById("studentInterests").value.trim(),
    githubLink: document.getElementById("studentGithub").value.trim(),
    linkedinLink: document.getElementById("studentLinkedin").value.trim(),
    shortBio: document.getElementById("studentBio").value.trim(),
    skills: getSelectedSkillsText()
  };

  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("UPDATE STUDENT PROFILE STATUS:", response.status);
    console.log("UPDATE STUDENT PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert("Profile could not be updated.");
      return;
    }

    alert("Profile updated successfully.");
    window.location.href = "st-profile.html";

  } catch (error) {
    console.error("Student profile update error:", error);
    alert("Server error while updating profile.");
  }
}