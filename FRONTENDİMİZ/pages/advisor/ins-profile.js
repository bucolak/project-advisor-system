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

    const savedStatus = localStorage.getItem("advisorStatus");
    renderStatus(savedStatus || advisor.advisingStatus || "ACTIVE");

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
    const response = await fetch(`${API_BASE}/api/projects/previously-supervised-types`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      renderProjectTypes([]);
      return;
    }

    const result = await response.json();
    const types = result.data || result || [];

    renderProjectTypes(types);

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
    container.innerHTML = `
      <div class="project-type-row">
        <span class="type-badge tubitak">-</span>
        <span class="type-text">No data</span>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  types.forEach(type => {
    const row = document.createElement("div");
    row.className = "project-type-row";

    row.innerHTML = `
      <span class="type-badge tubitak">${type}</span>
      <span class="type-text">${type}</span>
    `;

    container.appendChild(row);
  });
}

function renderStatus(status) {
  const normalizedStatus = String(status || "ACTIVE").toUpperCase();

  const inlineText = document.getElementById("advisorStatusTextInline");
  const dot = document.getElementById("advisorStatusDot");
  const cardText = document.getElementById("advisorStatusCardText");
  const button = document.getElementById("advisorStatusButton");

  if (inlineText) {
    inlineText.textContent = normalizedStatus;
  }

  if (cardText) {
    cardText.textContent = normalizedStatus === "ACTIVE"
      ? "You are currently active."
      : "You are currently inactive.";
  }

  if (button) {
    button.textContent = normalizedStatus === "ACTIVE" ? "Active" : "Inactive";
  }

  if (dot) {
    dot.style.backgroundColor = normalizedStatus === "ACTIVE" ? "#20b14b" : "#e53935";
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