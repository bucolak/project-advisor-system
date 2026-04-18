const API_BASE = "http://localhost:8080";

let currentAdvisorId = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupSearch();
  setupModal();

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
  await loadAdvisors(token);
  await loadStudentProjectsForModal(token, userId);
});

function setupDropdown() {
  const box = document.getElementById("advisorsStudentBox");
  const dropdown = document.getElementById("advisorProfileDropdown");

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
  const logoutBtn = document.getElementById("advisorsLogoutBtn");

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

function setupSearch() {
  const searchInput = document.getElementById("advisorSearch");

  searchInput.addEventListener("keyup", function () {
    filterAdvisors(this.value);
  });
}

function setupModal() {
  const closeBtn = document.getElementById("closeRequestModalBtn");
  const cancelBtn = document.getElementById("cancelRequestBtn");
  const sendBtn = document.getElementById("sendRequestBtn");
  const modal = document.getElementById("requestModal");

  closeBtn.addEventListener("click", closeRequestModal);
  cancelBtn.addEventListener("click", closeRequestModal);
  sendBtn.addEventListener("click", sendAdvisorRequest);

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
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return;
    }

    const profile = result.data;
    document.getElementById("advisorsStudentName").textContent =
      `${profile.firstName} ${profile.lastName}`;
  } catch (error) {
    console.error("Student profile load error:", error);
  }
}

async function loadAdvisors(token) {
  const tableBody = document.getElementById("advisorsTableBody");

  try {
    /*
      Bunu backend endpointinize göre düzenle:
      Örn:
      GET /api/advisors
      veya
      GET /api/students/advisors
    */
    const response = await fetch(`${API_BASE}/api/advisors`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
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
    const advisors = result.data || [];

    if (advisors.length === 0) {
      renderEmptyAdvisors("No advisor found.");
      return;
    }

    tableBody.innerHTML = "";

    advisors.forEach(advisor => {
      const row = document.createElement("tr");
      row.className = "advisor-row";
      row.dataset.status = (advisor.advisingStatus || "inactive").toLowerCase();

      const fullName = advisor.fullName || `${advisor.firstName || ""} ${advisor.lastName || ""}`.trim();
      const status = (advisor.advisingStatus || "INACTIVE").toUpperCase();
      const isActive = status === "ACTIVE";

      const expertiseHtml = (advisor.areasOfExpertise || advisor.expertise || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => `<span class="expertise-tag">${item}</span>`)
        .join("");

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
        <td id="action-${advisor.userId || advisor.id}">
          ${
            isActive
              ? `<button class="advisor-request-btn" data-advisor-id="${advisor.userId || advisor.id}">Request</button>`
              : `<span class="advisor-disabled-text">You cannot request!</span>`
          }
        </td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".advisor-request-btn").forEach(button => {
      button.addEventListener("click", function () {
        const advisorId = this.dataset.advisorId;
        openRequestModal(advisorId);
      });
    });

  } catch (error) {
    console.error("Advisors load error:", error);
    renderEmptyAdvisors("Server error while loading advisors.");
  }
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

  rows.forEach((row) => {
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

    if (matches) {
      found = true;
    }
  });

  if (input === "" || found) {
    tableWrapper.style.display = "block";
    noAdvisorMessage.style.display = "none";
  } else {
    tableWrapper.style.display = "none";
    noAdvisorMessage.style.display = "block";
  }
}

async function loadStudentProjectsForModal(token, userId) {
  const projectSelect = document.getElementById("projectSelect");

  try {
    /*
      Bunu da backend endpointinize göre düzenleyin.
      Muhtemel endpoint:
      GET /api/students/{userId}/created-projects
      veya
      GET /api/projects/student/{userId}
    */
    const response = await fetch(`${API_BASE}/api/students/${userId}/created-projects`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    const projects = result.data || [];

    projectSelect.innerHTML = `<option value="">Select a project</option>`;

    projects.forEach(project => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.title;
      projectSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Project list load error:", error);
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

  try {
    /*
      Bunu backend endpointinize göre düzenleyin.
      Muhtemel:
      POST /api/advisor-requests
    */
    const response = await fetch(`${API_BASE}/api/advisor-requests`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        advisorId: Number(currentAdvisorId),
        projectId: Number(selectedProjectId)
      })
    });

    const text = await response.text();
    console.log("SEND REQUEST STATUS:", response.status);
    console.log("SEND REQUEST RESPONSE:", text);

    if (!response.ok) {
      alert("Failed to send advisor request.");
      return;
    }

    const actionCell = document.getElementById(`action-${currentAdvisorId}`);
    const selectedProjectText = projectSelect.options[projectSelect.selectedIndex].text;

    actionCell.innerHTML = `
      <div class="requested-wrapper">
        <div class="requested-badge">Requested</div>
        <div class="requested-project-name">${selectedProjectText}</div>
      </div>
    `;

    closeRequestModal();
    alert("Advisor request sent successfully.");

  } catch (error) {
    console.error("Send request error:", error);
    alert("Server error while sending advisor request.");
  }
}