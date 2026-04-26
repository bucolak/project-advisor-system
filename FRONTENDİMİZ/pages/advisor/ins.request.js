const API_BASE = "http://localhost:8080";

let currentRequest = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupModal();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADVISOR") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdvisorProfile(token, userId);
  await loadAdvisorRequests(token);
});

function setupDropdown() {
  const userBox = document.getElementById("advisorUserBox");
  const dropdown = document.getElementById("profileDropdown");

  if (!userBox || !dropdown) return;

  userBox.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
    const modal = document.getElementById("studentModal");

    if (e.target === modal) closeStudentModal();

    if (!userBox.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("advisorLogoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  });
}

function setupModal() {
  document.getElementById("modalCloseBtn").addEventListener("click", closeStudentModal);

  document.getElementById("modalAcceptBtn").addEventListener("click", async function () {
    if (!currentRequest) return;
    await updateRequestStatus(currentRequest.id, "ACCEPTED");
    closeStudentModal();
  });

  document.getElementById("modalRejectBtn").addEventListener("click", async function () {
    if (!currentRequest) return;
    await updateRequestStatus(currentRequest.id, "REJECTED");
    closeStudentModal();
  });
}

async function loadAdvisorProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/advisors/${userId}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const advisor = result.data || result;

    document.getElementById("advisorTopName").textContent =
      `Dr. ${advisor.firstName || ""} ${advisor.lastName || ""}`.trim();

  } catch (error) {
    console.error("Advisor profile load error:", error);
  }
}

async function loadAdvisorRequests(token) {
  const container = document.getElementById("advisorRequestsContainer");
  const pendingCount = document.getElementById("pendingRequestCount");

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("ADVISOR REQUESTS STATUS:", response.status);
    console.log("ADVISOR REQUESTS RESPONSE:", text);

    if (!response.ok) {
      container.innerHTML = `
        <div class="request-card">
          <div class="request-card-left">
            <div class="request-project-title-row">
              <div class="request-project-title">Could not load requests</div>
            </div>
          </div>
        </div>
      `;

      pendingCount.textContent = "0 Pending Requests";
      return;
    }

    const result = JSON.parse(text);
    const requests = result.data || result || [];

    const pendingRequests = requests.filter(request =>
      String(request.status || "").toUpperCase() === "PENDING"
    );

    pendingCount.textContent = `${pendingRequests.length} Pending Requests`;

    if (!requests.length) {
      container.innerHTML = `
        <div class="request-card">
          <div class="request-card-left">
            <div class="request-project-title-row">
              <div class="request-project-title">No advisor requests</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    renderRequests(requests);

  } catch (error) {
    console.error("Advisor requests load error:", error);

    container.innerHTML = `
      <div class="request-card">
        <div class="request-card-left">
          <div class="request-project-title-row">
            <div class="request-project-title">Server error while loading requests</div>
          </div>
        </div>
      </div>
    `;

    pendingCount.textContent = "0 Pending Requests";
  }
}

function renderRequests(requests) {
  const container = document.getElementById("advisorRequestsContainer");
  container.innerHTML = "";

  requests.forEach(request => {
    const requestCardId = `request-${request.id}`;

    const studentName =
      request.studentName ||
      `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
      "Student";

    const projectType = request.projectType || "PROJECT";
    const badgeClass = getProjectTagClass(projectType);
    const status = String(request.status || "PENDING").toUpperCase();

    let actionsHtml = "";

    if (status === "PENDING") {
      actionsHtml = `
        <button class="accept-btn" data-request-id="${request.id}">Accept</button>
        <button class="reject-btn" data-request-id="${request.id}">Reject</button>
      `;
    } else if (status === "ACCEPTED") {
      actionsHtml = `
        <div class="request-final-status accepted-status">
          Accepted
        </div>
      `;
    } else if (status === "REJECTED") {
      actionsHtml = `
        <div class="request-final-status rejected-status">
          Rejected
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="request-final-status">
          ${status}
        </div>
      `;
    }

    const card = document.createElement("div");
    card.className = "request-card";
    card.id = requestCardId;

    card.innerHTML = `
      <div class="request-card-left">
        <div class="request-project-title-row">
          <div class="request-project-title">${request.projectTitle || "Project"}</div>
          <span class="request-tag ${badgeClass}">${projectType}</span>
        </div>

        <div class="request-info-line"><strong>Student:</strong> ${studentName}</div>
        <div class="request-info-line"><strong>Department:</strong> ${request.studentDepartment || request.department || "-"}</div>
        <div class="request-info-line"><strong>Skill:</strong> ${request.studentSkills || request.skills || "-"}</div>
        <div class="request-info-line"><strong>Status:</strong> ${status}</div>

        <button class="view-profile-btn" data-request-id="${request.id}">
          view student profile
        </button>
      </div>

      <div class="request-card-right">
        <div class="request-actions" id="${requestCardId}-actions">
          ${actionsHtml}
        </div>
      </div>
    `;

    container.appendChild(card);

    card.querySelector(".view-profile-btn").addEventListener("click", function () {
      openStudentModal(request);
    });

    const acceptBtn = card.querySelector(".accept-btn");
    const rejectBtn = card.querySelector(".reject-btn");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", async function () {
        await updateRequestStatus(request.id, "ACCEPTED");
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", async function () {
        await updateRequestStatus(request.id, "REJECTED");
      });
    }
  });
}

async function updateRequestStatus(requestId, status) {
  const token = localStorage.getItem("token");

  if (!requestId) {
    alert("Request id not found.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/${requestId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: status
      })
    });

    const text = await response.text();

    console.log("UPDATE REQUEST STATUS:", response.status);
    console.log("UPDATE REQUEST RESPONSE:", text);

    if (!response.ok) {
      alert("Failed to update request status.");
      return;
    }

    await loadAdvisorRequests(token);

  } catch (error) {
    console.error("Update request status error:", error);
    alert("Server error while updating request status.");
  }
}

function openStudentModal(request) {
  currentRequest = request;

  const status = String(request.status || "PENDING").toUpperCase();

  document.getElementById("modalStudentName").textContent =
    request.studentName ||
    `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
    "Student";

  document.getElementById("modalStudentDepartment").textContent =
    request.studentDepartment || request.department || "-";

  document.getElementById("modalProjectTag").textContent =
    request.projectType || "PROJECT";

  setList("modalRelevantCourses", []);
  setList("modalResearchInterests", []);
  setOtherProjects([]);

  const modalAcceptBtn = document.getElementById("modalAcceptBtn");
  const modalRejectBtn = document.getElementById("modalRejectBtn");

  if (status === "PENDING") {
    modalAcceptBtn.style.display = "inline-block";
    modalRejectBtn.style.display = "inline-block";
  } else {
    modalAcceptBtn.style.display = "none";
    modalRejectBtn.style.display = "none";
  }

  document.getElementById("studentModal").classList.add("active");
}

function closeStudentModal() {
  document.getElementById("studentModal").classList.remove("active");
  currentRequest = null;
}

function setList(elementId, items) {
  const ul = document.getElementById(elementId);

  if (!items || !items.length) {
    ul.innerHTML = "<li>No data</li>";
    return;
  }

  ul.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}

function setOtherProjects(projects) {
  const container = document.getElementById("modalOtherProjects");

  if (!projects || !projects.length) {
    container.innerHTML = `
      <div class="other-project-card">
        <h4>No other projects</h4>
        <p><strong>Project:</strong> No data</p>
        <p><strong>Skills:</strong> -</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "other-project-card";

    card.innerHTML = `
      <h4>${project.title || "-"}</h4>
      <p><strong>Project:</strong> ${project.description || "-"}</p>
      <p><strong>Skills:</strong> ${project.skills || "-"}</p>
    `;

    container.appendChild(card);
  });
}

function getProjectTagClass(projectType) {
  const value = String(projectType || "").toUpperCase();

  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";
  if (value.includes("TEKNOFEST")) return "teknofest";

  return "tubitak";
}