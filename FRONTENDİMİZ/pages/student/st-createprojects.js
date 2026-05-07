const API_BASE = "http://localhost:8080";

let selectedAdvisorRequired = true;
let courseCategoryId = null;

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
  setupTabs();
  setupSkillTags();
  setupAdvisorToggle();
  setupForms(token, userId);


  await loadStudentInfo(token, userId);
  await loadProjectCategories(token);
});

async function loadStudentInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const student = result.data || result;

    const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();

    renderTopbar("topbarArea", fullName, "Student");
  } catch (error) {
    console.error("Student info load error:", error);
  }
}

async function loadProjectCategories(token) {
  const select = document.getElementById("projectTypeSelect");

  try {
    const response = await fetch(`${API_BASE}/api/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      select.innerHTML = `<option value="">Could not load project types</option>`;
      return;
    }

    const result = await response.json();
    const categories = result.data || result || [];

    const courseCategory = categories.find(category => {
      const name = String(category.name || "").toUpperCase();
      return name === "COURSE";
    });

    courseCategoryId = courseCategory ? courseCategory.id : null;

    const otherCategories = categories.filter(category => {
      const name = String(category.name || "").toUpperCase();
      return name !== "COURSE";
    });

    select.innerHTML = `<option value="">Select a project type</option>`;

    otherCategories.forEach(category => {
      const option = document.createElement("option");

      option.value = category.id;
      option.textContent = category.name;
      option.dataset.name = category.name;
      option.dataset.advisorRequired = String(category.advisorRequired);
      option.dataset.teamSize = category.teamSize;

      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      const selectedOption = select.options[select.selectedIndex];

      if (!selectedOption || !selectedOption.value) {
        selectedAdvisorRequired = true;
        applyAdvisorRule();
        return;
      }

      selectedAdvisorRequired = selectedOption.dataset.advisorRequired === "true";
      

      const teamSizeInput = document.getElementById("otherTeamSize");

const maxTeamSize = selectedOption.dataset.teamSize;

if (teamSizeInput && maxTeamSize) {
  teamSizeInput.placeholder = `Max ${maxTeamSize} students`;
  teamSizeInput.max = maxTeamSize;
  teamSizeInput.min = 1;
}

applyAdvisorRule();
    });

  } catch (error) {
    console.error("Project categories load error:", error);
    select.innerHTML = `<option value="">Server error</option>`;
  }
}

function applyAdvisorRule() {
  const advisorBox = document.getElementById("advisorChoiceBox");

  if (!advisorBox) return;

  advisorBox.style.display = selectedAdvisorRequired ? "flex" : "none";
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", function () {
      const target = button.dataset.tab;

      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
}

function setupSkillTags() {
  const skillTags = document.querySelectorAll(".skill-tag");

  skillTags.forEach(tag => {
    tag.addEventListener("click", function () {
      tag.classList.toggle("selected");
    });
  });
}

function setupAdvisorToggle() {
  const advisorButtons = document.querySelectorAll(".toggle-btn");

  advisorButtons.forEach(button => {
    button.addEventListener("click", function () {
      advisorButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

function setupForms(token, userId) {
  document.getElementById("courseProjectForm").addEventListener("submit", function (e) {
    e.preventDefault();
    createCourseProject(token, userId);
  });

  document.getElementById("otherProjectForm").addEventListener("submit", function (e) {
    e.preventDefault();
    createOtherProject(token, userId);
  });
}

async function createCourseProject(token, userId) {
  const selectedSkills = getSelectedSkills("courseProject");

  if (!courseCategoryId) {
    alert("Course category could not be found. Please check database default categories.");
    return;
  }

  const payload = {
    title: document.getElementById("courseTitle").value.trim(),
    categoryId: Number(courseCategoryId),
    studentId: Number(userId),
    requiredSkills: selectedSkills.join(", "),
    teamSize: Number(document.getElementById("courseTeamSize").value),
    rolesNeeded: document.getElementById("courseRoles").value.trim(),
    description: document.getElementById("courseDescription").value.trim(),
    advisorRequired: false
  };

  await submitProject(token, payload);
}

async function createOtherProject(token, userId) {
  const selectedSkills = getSelectedSkills("otherProject");

  const projectTypeSelect = document.getElementById("projectTypeSelect");

  if (!projectTypeSelect.value) {
    alert("Please select a project type.");
    return;
  }

  const selectedAdvisorButton = document.querySelector("#advisorChoiceBox .toggle-btn.active");

  const advisorRequired = selectedAdvisorRequired
    ? selectedAdvisorButton?.dataset.advisor === "yes"
    : false;

  const payload = {
    title: document.getElementById("otherTitle").value.trim(),
    categoryId: Number(projectTypeSelect.value),
    studentId: Number(userId),
    requiredSkills: selectedSkills.join(", "),
    teamSize: Number(document.getElementById("otherTeamSize").value),
    rolesNeeded: document.getElementById("otherRoles").value.trim(),
    description: document.getElementById("otherDescription").value.trim(),
    advisorRequired: advisorRequired
  };

  await submitProject(token, payload);
}

async function submitProject(token, payload) {
 if (!payload.title || !payload.description || !payload.rolesNeeded) {
  alert("Please fill all required fields.");
  return;
}

if (!payload.teamSize || payload.teamSize <= 0) {
  alert("Team size must be greater than 0.");
  return;
}

if (!payload.requiredSkills) {
  alert("Please select at least one skill.");
  return;
}

  try {
    const response = await fetch(`${API_BASE}/api/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("CREATE PROJECT STATUS:", response.status);
    console.log("CREATE PROJECT PAYLOAD:", payload);
    console.log("CREATE PROJECT RESPONSE:", text);

    if (!response.ok) {
      alert("Project could not be created.");
      return;
    }

    alert("Project created successfully.");
    window.location.href = "st-projects.html";

  } catch (error) {
    console.error("Create project error:", error);
    alert("Server error while creating project.");
  }
}

function getSelectedSkills(sectionId) {
  const section = document.getElementById(sectionId);
  const selected = section.querySelectorAll(".skill-tag.selected");

  return Array.from(selected).map(tag => tag.textContent.trim());
}