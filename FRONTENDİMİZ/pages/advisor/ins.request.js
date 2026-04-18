const API_BASE = "http://localhost:8080";

let currentRequest = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupDropdown();
  setupLogout();
  setupModal();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  console.log("TOKEN:", token);
  console.log("USER ID:", userId);
  console.log("ROLE:", role);

  if (!token || !userId || role !== "ADVISOR") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdvisorProfile(token, userId);
  await loadPendingAdvisorRequests(token);
  focusTargetRequestFromQuery();
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
    if (e.target === modal) {
      closeStudentModal();
    }

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
  const closeBtn = document.getElementById("modalCloseBtn");
  const acceptBtn = document.getElementById("modalAcceptBtn");
  const rejectBtn = document.getElementById("modalRejectBtn");

  closeBtn.addEventListener("click", closeStudentModal);

  acceptBtn.addEventListener("click", async function () {
    if (!currentRequest) return;
    await updateRequestStatus(currentRequest.id, "ACCEPTED");
    closeStudentModal();
  });

  rejectBtn.addEventListener("click", async function () {
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
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("ADVISOR PROFILE STATUS:", response.status);
    console.log("ADVISOR PROFILE RESPONSE:", text);

    if (!response.ok) return;

    const result = JSON.parse(text);
    if (!result.success || !result.data) return;

    const advisor = result.data;
    document.getElementById("advisorTopName").textContent =
      `Dr. ${advisor.firstName || ""} ${advisor.lastName || ""}`.trim();
  } catch (error) {
    console.error("Advisor profile load error:", error);
  }
}

async function loadPendingAdvisorRequests(token) {
  const container = document.getElementById("advisorRequestsContainer");
  const pendingCount = document.getElementById("pendingRequestCount");

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/pending`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("PENDING REQUESTS STATUS:", response.status);
    console.log("PENDING REQUESTS RESPONSE:", text);

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
    const requests = result.data || [];

    pendingCount.textContent = `${requests.length} Pending Requests`;

    if (!requests.length) {
      container.innerHTML = `
        <div class="request-card">
          <div class="request-card-left">
            <div class="request-project-title-row">
              <div class="request-project-title">No pending requests</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    requests.forEach((request, index) => {
      const requestCardId = `request-${request.id || index}`;

      const studentName =
        request.studentName ||
        `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
        "Student";

      const projectType = request.projectType || "PROJECT";
      const badgeClass = getProjectTagClass(projectType);

      const skillText = request.skills || request.studentSkills || "-";
      const department = request.department || request.studentDepartment || "-";
      const projectTitle = request.projectTitle || "Project";

      const card = document.createElement("div");
      card.className = "request-card";
      card.id = requestCardId;

      card.innerHTML = `
        <div class="request-card-left">
          <div class="request-project-title-row">
            <div class="request-project-title">${projectTitle}</div>
            <span class="request-tag ${badgeClass}">${projectType}</span>
          </div>

          <div class="request-info-line"><strong>Student:</strong> ${studentName}</div>
          <div class="request-info-line"><strong>Department:</strong> ${department}</div>
          <div class="request-info-line"><strong>Skill:</strong> ${skillText}</div>

          <button class="view-profile-btn" data-request-id="${request.id || ""}">
            view student profile
          </button>
        </div>

        <div class="request-card-right">
          <div class="request-actions" id="${requestCardId}-actions">
            <button class="accept-btn" data-request-id="${request.id || ""}">Accept</button>
            <button class="reject-btn" data-request-id="${request.id || ""}">Reject</button>
          </div>
        </div>
      `;

      container.appendChild(card);

      const viewBtn = card.querySelector(".view-profile-btn");
      const acceptBtn = card.querySelector(".accept-btn");
      const rejectBtn = card.querySelector(".reject-btn");

      viewBtn.addEventListener("click", function () {
        openStudentModal(request);
      });

      acceptBtn.addEventListener("click", async function () {
        await updateRequestStatus(request.id, "ACCEPTED");
      });

      rejectBtn.addEventListener("click", async function () {
        await updateRequestStatus(request.id, "REJECTED");
      });
    });

  } catch (error) {
    console.error("Pending advisor requests load error:", error);
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
        "Authorization": `Bearer ${token}`,
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

    const card = document.querySelector(`button[data-request-id="${requestId}"]`)?.closest(".request-card");
    const actions = card?.querySelector(".request-actions");

    if (actions) {
      actions.innerHTML = `
        <div class="request-final-status ${status === "ACCEPTED" ? "accepted-status" : "rejected-status"}">
          ${status === "ACCEPTED" ? "Accepted" : "Rejected"}
        </div>
      `;
    }

    const currentCountText = document.getElementById("pendingRequestCount").textContent;
    const currentCount = parseInt(currentCountText, 10) || 0;
    const nextCount = Math.max(0, currentCount - 1);
    document.getElementById("pendingRequestCount").textContent = `${nextCount} Pending Requests`;

  } catch (error) {
    console.error("Update request status error:", error);
    alert("Server error while updating request status.");
  }
}

function openStudentModal(request) {
  currentRequest = request;

  document.getElementById("modalStudentName").textContent =
    request.studentName ||
    `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
    "Student";

  document.getElementById("modalStudentDepartment").textContent =
    request.department || request.studentDepartment || "-";

  document.getElementById("modalProjectTag").textContent =
    request.projectType || "PROJECT";

  setList("modalRelevantCourses", request.relevantCourses);
  setList("modalResearchInterests", request.researchInterests);
  setOtherProjects(request.otherProjects);

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
    const div = document.createElement("div");
    div.className = "other-project-card";

    div.innerHTML = `
      <div class="project-mini-tag ${getProjectTagClass(project.projectType)}">${project.projectType || "PROJECT"}</div>
      <h4>${project.title || "-"}</h4>
      <p><strong>Project:</strong> ${project.role || "-"}</p>
      <p><strong>Skills:</strong> ${project.skills || "-"}</p>
    `;

    container.appendChild(div);
  });
}

function getProjectTagClass(projectType) {
  const value = String(projectType || "").toUpperCase();

  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";
  if (value.includes("TEKNOFEST")) return "teknofest";

  return "tubitak";
}

function focusTargetRequestFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("target");

  if (!targetId) return;

  const targetCard = document.getElementById(targetId);

  if (targetCard) {
    setTimeout(() => {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      targetCard.classList.add("request-card-highlight");

      setTimeout(() => {
        targetCard.classList.remove("request-card-highlight");
      }, 3000);
    }, 150);
  }
}