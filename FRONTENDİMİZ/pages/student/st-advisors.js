const API_BASE = "https://project-advisor-system.onrender.com";

let currentAdvisorId = null;
let advisorsById = {};

document.addEventListener("DOMContentLoaded", async function () {
  setupSearch();
  setupModal();

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
  await loadAdvisors(token);
  await loadStudentProjectsForModal(token);
});

function setupSearch() {
  const searchInput = document.getElementById("advisorSearch");

  if (!searchInput) return;

  searchInput.addEventListener("keyup", function () {
    filterAdvisors(this.value);
  });
}

function setupModal() {
  document.getElementById("closeRequestModalBtn").addEventListener("click", closeRequestModal);
  document.getElementById("cancelRequestBtn").addEventListener("click", closeRequestModal);
  document.getElementById("sendRequestBtn").addEventListener("click", sendAdvisorRequest);

  const modal = document.getElementById("requestModal");

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeRequestModal();
    }
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

    if (!response.ok) return;

    const result = await response.json();
    const profile = result.data || result;

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

    renderTopbar("topbarArea", fullName || "Student", "Student");

  } catch (error) {
    console.error("Student profile load error:", error);
  }
}

async function loadAdvisors(token) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("ADVISORS STATUS:", response.status);
    console.log("ADVISORS RESPONSE:", text);

    if (!response.ok) {
      renderEmptyAdvisors("Could not load advisors.");
      return;
    }

    const result = JSON.parse(text);
    const advisors = result.data || result || [];

    advisors.sort((a, b) => {
      const nameA = (
        a.fullName ||
        `${a.firstName || ""} ${a.lastName || ""}`
      ).trim().toLocaleLowerCase("tr-TR");

      const nameB = (
        b.fullName ||
        `${b.firstName || ""} ${b.lastName || ""}`
      ).trim().toLocaleLowerCase("tr-TR");

      return nameA.localeCompare(nameB, "tr-TR");
    });

    if (!advisors.length) {
      renderEmptyAdvisors("No advisor found.");
      return;
    }

    renderAdvisors(advisors);

  } catch (error) {
    console.error("Advisors load error:", error);
    renderEmptyAdvisors("Server error while loading advisors.");
  }
}

function renderAdvisors(advisors) {
  const tableBody = document.getElementById("advisorsTableBody");
  tableBody.innerHTML = "";

  advisorsById = {};

  advisors.forEach(advisor => {
    const advisorId = advisor.userId || advisor.id;
    advisorsById[String(advisorId)] = advisor;

    const fullName =
      advisor.fullName ||
      `${advisor.firstName || ""} ${advisor.lastName || ""}`.trim();

    const advisingStatus = String(
      advisor.advisingStatus ||
      advisor.advisorStatus ||
      "INACTIVE"
    ).toUpperCase();

    const userStatus = String(
      advisor.userStatus ||
      "INACTIVE"
    ).toUpperCase();

    const isActive =
      advisingStatus === "ACTIVE" &&
      userStatus === "ACTIVE";

    const expertiseHtml = String(advisor.areasOfExpertise || advisor.expertise || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => `<span class="expertise-tag">${item}</span>`)
      .join("");

    const row = document.createElement("tr");
    row.className = "advisor-row";
    row.dataset.status = isActive ? "active" : "inactive";

    row.innerHTML = `
      <td>
        <div class="advisor-name-cell">
          <i class="fa-regular fa-circle-user"></i>

          <div class="advisor-name-text">
            <span>${fullName || "-"}</span>
          </div>

          <span class="advisor-dot ${isActive ? "green" : "red"}"></span>
        </div>
      </td>

      <td>${advisor.department || "-"}</td>

      <td>
        <div class="expertise-tags">
          ${expertiseHtml || '<span class="expertise-tag">-</span>'}
        </div>
      </td>

      <td id="action-${advisorId}">
        ${
          isActive
            ? `<button class="advisor-request-btn" data-advisor-id="${advisorId}">Request</button>`
            : `<span class="advisor-disabled-text">You cannot request!</span>`
        }
      </td>
    `;

    tableBody.appendChild(row);
  });

  document.querySelectorAll(".advisor-request-btn").forEach(button => {
    button.addEventListener("click", function () {
      openRequestModal(this.dataset.advisorId);
    });
  });
}

function renderEmptyAdvisors(message) {
  const tableBody = document.getElementById("advisorsTableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="4">${message}</td>
    </tr>
  `;
}

function filterAdvisors(inputValue) {
  const input = inputValue.toLowerCase().trim();
  const rows = document.querySelectorAll(".advisor-row");
  const noAdvisorMessage = document.getElementById("noAdvisorMessage");
  const tableWrapper = document.getElementById("advisorsTableWrapper");

  let found = false;

  rows.forEach(row => {
    const rowText = row.textContent.toLowerCase();
    const status = row.dataset.status.toLowerCase();

    let matches = false;

    if (input === "") {
      matches = true;
    } else if ("active".startsWith(input) || "inactive".startsWith(input)) {
      matches = status.startsWith(input);
    } else {
      matches = rowText.includes(input);
    }

    row.style.display = matches ? "" : "none";

    if (matches) found = true;
  });

  if (input === "" || found) {
    tableWrapper.style.display = "block";
    noAdvisorMessage.style.display = "none";
  } else {
    tableWrapper.style.display = "none";
    noAdvisorMessage.style.display = "block";
  }
}

async function loadStudentProjectsForModal(token) {
  const projectSelect = document.getElementById("projectSelect");

  try {
    const [projectsResponse, requestsResponse] = await Promise.all([
      fetch(`${API_BASE}/api/projects/my-projects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
      fetch(`${API_BASE}/api/advisor-requests/my-requests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    ]);

    if (!projectsResponse.ok) {
      projectSelect.innerHTML = `<option value="">Could not load projects</option>`;
      return;
    }

    const projectsResult = await projectsResponse.json();
    const projects = projectsResult.data || projectsResult || [];

    let requests = [];

    if (requestsResponse.ok) {
      const requestsResult = await requestsResponse.json();
      requests = requestsResult.data || requestsResult || [];
    }

    const blockedProjectIds = new Set(
      requests
        .filter(request => {
          const status = String(request.status || "").toUpperCase();
          return status === "PENDING" || status === "ACCEPTED";
        })
        .map(request => String(request.projectId))
    );

    projectSelect.innerHTML = `<option value="">Select a project</option>`;

    const selectableProjects = projects.filter(project => {
      const categoryName = String(
        project.category?.name ||
        project.categoryName ||
        project.projectType ||
        ""
      ).toUpperCase();

      const advisorRequired =
        project.advisorRequired ??
        project.category?.advisorRequired ??
        true;

      return categoryName !== "COURSE" && advisorRequired !== false;
    });

    if (!selectableProjects.length) {
      projectSelect.innerHTML = `<option value="">No advisor-required project found</option>`;
      return;
    }

    selectableProjects.forEach(project => {
      const option = document.createElement("option");
      option.value = project.id;

      const isBlocked = blockedProjectIds.has(String(project.id));

      option.textContent = isBlocked
        ? `${project.title} (request already pending/accepted)`
        : project.title;

      option.disabled = isBlocked;

      projectSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Project list load error:", error);
    projectSelect.innerHTML = `<option value="">Server error</option>`;
  }
}

function openRequestModal(advisorId) {
  currentAdvisorId = advisorId;
  document.getElementById("requestModal").classList.add("show");
  document.getElementById("projectSelect").value = "";
}

function closeRequestModal() {
  document.getElementById("requestModal").classList.remove("show");
  currentAdvisorId = null;
}

async function sendAdvisorRequest() {
  const token = localStorage.getItem("token");
  const projectSelect = document.getElementById("projectSelect");
  const selectedProjectId = projectSelect.value;

  if (!selectedProjectId || !currentAdvisorId) {
    alert("Please select a project.");
    return;
  }

  const advisorIdToRestore = currentAdvisorId;

  const selectedAdvisor = advisorsById[String(currentAdvisorId)];

  if (selectedAdvisor) {
    const currentQuota = Number(selectedAdvisor.currentQuota ?? 0);
    const maxQuota = Number(selectedAdvisor.maxQuota ?? 5);

    if (currentQuota >= maxQuota) {
      alert(" The advisor has already 5 projects. You cannot send a request.");
      return;
    }
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/projects/${selectedProjectId}/request-advisor/${currentAdvisorId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const text = await response.text();

    console.log("SEND REQUEST STATUS:", response.status);
    console.log("SEND REQUEST RESPONSE:", text);

    if (!response.ok) {
      if (text.includes(" The advisor has already 5 projects")) {
        alert("The advisor has already 5 projects. You cannot send a request.");
        return;
      }

      if (text.includes("already pending or accepted")) {
        alert("This project already has a pending or accepted advisor request.");
        return;
      }

      if (text.includes("already sent")) {
        alert("You have already sent a request to this advisor.");
        return;
      }

      alert("Failed to send advisor request.");
      return;
    }

    const actionCell = document.getElementById(`action-${advisorIdToRestore}`);

    const selectedProjectText =
      projectSelect.options[projectSelect.selectedIndex].text;

    const selectedOption = projectSelect.options[projectSelect.selectedIndex];

    if (selectedOption) {

  selectedOption.disabled = true;

  const cleanProjectText = selectedProjectText

    .replace(" (request already pending/accepted)", "")

    .trim();

  selectedOption.textContent = `${cleanProjectText} (request already pending/accepted)`;

}

    if (actionCell) {
      actionCell.innerHTML = `
        <div class="requested-wrapper">
          <div class="requested-badge">Requested</div>

          <div class="requested-project-name">
            ${selectedProjectText}
          </div>
        </div>
      `;

      setTimeout(() => {
        actionCell.innerHTML = `
          <button class="advisor-request-btn" data-advisor-id="${advisorIdToRestore}">
            Request
          </button>
        `;

        actionCell
          .querySelector(".advisor-request-btn")
          .addEventListener("click", function () {
            openRequestModal(this.dataset.advisorId);
          });

      }, 2000);
    }

    closeRequestModal();
    alert("Advisor request sent successfully.");

  } catch (error) {
    console.error("Send request error:", error);
    alert("Server error while sending advisor request.");
  }
}
