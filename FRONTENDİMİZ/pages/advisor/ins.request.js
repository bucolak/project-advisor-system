const API_BASE = "http://localhost:8080";

let currentRequest = null;

document.addEventListener("DOMContentLoaded", async function () {
  setupModal();

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
  await loadAdvisorRequests(token);

  highlightTargetRequest();
});

function setupModal() {
  const closeBtn = document.getElementById("modalCloseBtn");
  const acceptBtn = document.getElementById("modalAcceptBtn");
  const rejectBtn = document.getElementById("modalRejectBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeStudentModal);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", async function () {
      if (!currentRequest) return;
      await updateRequestStatus(currentRequest.id, "ACCEPTED");
      closeStudentModal();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", async function () {
      if (!currentRequest) return;
      await updateRequestStatus(currentRequest.id, "REJECTED");
      closeStudentModal();
    });
  }

  window.addEventListener("click", function (e) {
    const modal = document.getElementById("studentModal");
    if (e.target === modal) closeStudentModal();
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

    const fullName =
      `Dr. ${advisor.firstName || ""} ${advisor.lastName || ""}`.trim();

    renderTopbar("topbarArea", fullName, "Advisor");

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

    const pendingRequests = requests.filter(
      request => String(request.status).toUpperCase() === "PENDING"
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

        <button class="view-profile-btn" data-request-id="${request.id}">
          view student profile
        </button>
      </div>

      <div class="request-card-right">
        <div class="request-actions" id="${requestCardId}-actions">
          ${
            status === "PENDING"
              ? `
                <button class="accept-btn" data-request-id="${request.id}">Accept</button>
                <button class="reject-btn" data-request-id="${request.id}">Reject</button>
              `
              : `
                <div class="request-final-status ${status === "ACCEPTED" ? "accepted-status" : "rejected-status"}">
                  ${status === "ACCEPTED" ? "Accepted" : "Rejected"}
                </div>
              `
          }
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

    const card = document.getElementById(`request-${requestId}`);
    const actions = card?.querySelector(".request-actions");

    if (actions) {
      actions.innerHTML = `
        <div class="request-final-status ${status === "ACCEPTED" ? "accepted-status" : "rejected-status"}">
          ${status === "ACCEPTED" ? "Accepted" : "Rejected"}
        </div>
      `;
    }

    const countEl = document.getElementById("pendingRequestCount");
    const currentCount = parseInt(countEl.textContent, 10) || 0;
    const nextCount = Math.max(0, currentCount - 1);
    countEl.textContent = `${nextCount} Pending Requests`;

  } catch (error) {
    console.error("Update request status error:", error);
    alert("Server error while updating request status.");
  }
}

function highlightTargetRequest() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("target");

  if (!targetId) return;

  setTimeout(() => {
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    targetElement.classList.add("highlight-request");

    setTimeout(() => {
      targetElement.classList.remove("highlight-request");
    }, 3000);
  }, 300);
}

function openStudentModal(request) {
  currentRequest = request;

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

  document.getElementById("studentModal").classList.add("active");
}

function closeStudentModal() {
  document.getElementById("studentModal").classList.remove("active");
  currentRequest = null;
}

function setList(elementId, items) {
  const ul = document.getElementById(elementId);

  if (!ul) return;

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

  if (!container) return;

  if (!projects || !projects.length) {
    container.innerHTML = `
      <div class="other-project-card">
        <h4>No other projects</h4>
        <p><strong>Project:</strong> No data</p>
        <p><strong>Skills:</strong> -</p>
      </div>
    `;
  }
}

function getProjectTagClass(projectType) {
  const value = String(projectType || "").toUpperCase();

  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";
  if (value.includes("TEKNOFEST")) return "teknofest";

  return "tubitak";
}