const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADVISOR") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  renderSidebar(role);
  await loadAdvisorProfile(token, userId);
});

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

    renderTopbar("topbarArea", fullName || "Advisor", "Advisor");

    setText("advisorProfileName", fullName || "Advisor");
    setText("advisorDepartment", advisor.department || "-");
    setText("advisorTitle", advisor.title || "-");
    setText("advisorEmail", advisor.email || "-");

    renderExpertise(advisor.areasOfExpertise);
    renderResearch(advisor.researchInterests);

    await loadPreviouslySupervisedProjectTypes(token);

    renderStatus(advisor.advisingStatus);

  } catch (error) {
    console.error("Advisor profile load error:", error);
    alert("Server error while loading advisor profile.");
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function renderExpertise(expertiseData) {
  const container = document.getElementById("advisorExpertiseTags");
  if (!container) return;

  const expertiseList = normalizeToArray(expertiseData);

  if (expertiseList.length === 0) {
    container.innerHTML = `<span>No expertise found</span>`;
    return;
  }

  container.innerHTML = "";

  expertiseList.forEach(item => {
    const span = document.createElement("span");
    span.textContent = item;
    container.appendChild(span);
  });
}

function renderResearch(researchData) {
  const list = document.getElementById("advisorResearchList");
  if (!list) return;

  const researchList = normalizeToArray(researchData);

  if (researchList.length === 0) {
    list.innerHTML = `<li>No research interests found</li>`;
    return;
  }

  list.innerHTML = "";

  researchList.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

async function loadPreviouslySupervisedProjectTypes(token) {
  const container = document.getElementById("advisorProjectTypes");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/api/advisors/my-students`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("PREVIOUSLY SUPERVISED TYPES STATUS:", response.status);
    console.log("PREVIOUSLY SUPERVISED TYPES RESPONSE:", text);

    if (!response.ok) {
      renderProjectTypes([]);
      return;
    }

    const result = JSON.parse(text);
    const projects = result.data || result || [];

    const types = projects
      .map(project => project.projectType)
      .filter(type => type && String(type).trim() !== "");

    const uniqueTypes = [...new Set(types)];

    renderProjectTypes(uniqueTypes);

  } catch (error) {
    console.error("Previously supervised project types load error:", error);
    renderProjectTypes([]);
  }
}

function renderProjectTypes(typesData) {
  const container = document.getElementById("advisorProjectTypes");
  if (!container) return;

  const types = normalizeToArray(typesData);

  if (types.length === 0) {
    container.innerHTML = `<ul><li>No data</li></ul>`;
    return;
  }

  container.innerHTML = `
    <ul class="advisor-project-type-list">
      ${types.map(type => `<li>${type}</li>`).join("")}
    </ul>
  `;
}

function renderStatus(status) {
  const normalizedStatus = String(status || "").toUpperCase();


  const cardText = document.getElementById("advisorStatusCardText");
  const button = document.getElementById("advisorStatusButton");

 

  if (cardText) {
    if (normalizedStatus === "ACTIVE") {
      cardText.textContent = "You are currently active.";
    } else if (normalizedStatus === "INACTIVE") {
      cardText.textContent = "You are currently inactive.";
    } else {
      cardText.textContent = "Loading status...";
    }
  }

  if (button) {
    button.classList.remove("status-active", "status-inactive");

    if (normalizedStatus === "ACTIVE") {
      button.textContent = "Active";
      button.classList.add("status-active");
    } else if (normalizedStatus === "INACTIVE") {
      button.textContent = "Inactive";
      button.classList.add("status-inactive");
    } else {
      button.textContent = "-";
    }
  }

}

function normalizeToArray(data) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(item => item !== null && item !== undefined && String(item).trim() !== "");
  }

  if (typeof data === "string") {
    return data
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
  }

  return [];
}