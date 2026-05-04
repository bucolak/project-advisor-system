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
  await loadAdvisorNotifications(token);
});

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

    const firstName = advisor.firstName || "";
    const lastName = advisor.lastName || "";
    const fullName = `Dr. ${`${firstName} ${lastName}`.trim()}`.trim();

    renderTopbar("topbarArea", fullName, "Advisor");

  } catch (error) {
    console.error("Advisor profile load error:", error);
  }
}

async function loadAdvisorNotifications(token) {
  const container = document.getElementById("advisorNotificationsContainer");
  const countEl = document.getElementById("advisorNotifCount");

  try {
    const response = await fetch(`${API_BASE}/api/advisor-requests/pending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      container.innerHTML = `
        <div class="advisor-notif-card">
          <div class="advisor-notif-card-left">
            <i class="fa-regular fa-circle-user"></i>
          </div>
          <div class="advisor-notif-card-middle">
            <p>Could not load notifications.</p>
          </div>
          <div class="advisor-notif-card-right"></div>
        </div>
      `;
      countEl.textContent = "0 New";
      return;
    }

    const result = JSON.parse(text);
    const requests = result.data || result || [];

    countEl.textContent = `${requests.length} New`;

    if (!requests.length) {
      container.innerHTML = `
        <div class="advisor-notif-card">
          <div class="advisor-notif-card-left">
            <i class="fa-regular fa-circle-user"></i>
          </div>
          <div class="advisor-notif-card-middle">
            <p>No new notifications.</p>
          </div>
          <div class="advisor-notif-card-right"></div>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    requests.forEach((item, index) => {
      const studentName =
        item.studentName ||
        `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
        "Student";

      const projectTitle = item.projectTitle || "Project";
      const projectType = item.projectType || "PROJECT";
      const badgeClass = getNotifTagClass(projectType);

      const requestId = item.id;
      const targetId = `request-${requestId || index}`;

      const card = document.createElement("div");
      card.className = "advisor-notif-card";

      card.innerHTML = `
        <div class="advisor-notif-card-left">
          <i class="fa-regular fa-circle-user"></i>
        </div>

        <div class="advisor-notif-card-middle">
          <p>
            <strong>${studentName}</strong> has submitted a new advisor request for the
            <strong>“${projectTitle}”</strong> project.
          </p>
          <span class="advisor-notif-tag ${badgeClass}">${projectType}</span>
        </div>

        <div class="advisor-notif-card-right">
          <a href="ins.request.html?target=${targetId}" class="advisor-notif-view-btn">
            view
          </a>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Advisor notifications load error:", error);

    container.innerHTML = `
      <div class="advisor-notif-card">
        <div class="advisor-notif-card-left">
          <i class="fa-regular fa-circle-user"></i>
        </div>
        <div class="advisor-notif-card-middle">
          <p>Server error while loading notifications.</p>
        </div>
        <div class="advisor-notif-card-right"></div>
      </div>
    `;

    countEl.textContent = "0 New";
  }
}

function getNotifTagClass(projectType) {
  const value = String(projectType || "").toUpperCase();

  if (value.includes("TEKNOFEST")) return "teknofest";
  if (value.includes("TÜBİTAK") || value.includes("TUBITAK")) return "tubitak";

  return "tubitak";
}