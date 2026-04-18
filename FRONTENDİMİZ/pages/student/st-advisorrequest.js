const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
    setupDropdown();
    setupLogout();

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
    await loadAdvisorRequests(token, userId);
});

function setupDropdown() {
    const studentBox = document.getElementById("studentBox");
    const profileDropdown = document.getElementById("profileDropdown");

    studentBox.addEventListener("click", function (e) {
        e.stopPropagation();
        profileDropdown.classList.toggle("show");
    });

    window.addEventListener("click", function (e) {
        if (!studentBox.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove("show");
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
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
        document.getElementById("studentName").textContent =
            `${profile.firstName} ${profile.lastName}`;

    } catch (error) {
        console.error("Profile load error:", error);
    }
}

async function loadAdvisorRequests(token, userId) {
    const tableBody = document.getElementById("advisorRequestsTableBody");

    try {
        /*
          Endpoint'i kendi backend'inizdeki gerçek endpoint ile değiştirin.
          Büyük ihtimalle sizde biri olacak:

          /api/advisor-requests/student/{userId}
          veya
          /api/students/{userId}/advisor-requests
        */

        const response = await fetch(
            `${API_BASE}/api/advisor-requests/student/${userId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const text = await response.text();

        console.log("ADVISOR REQUESTS STATUS:", response.status);
        console.log("ADVISOR REQUESTS RESPONSE:", text);

        if (!response.ok) {
            renderEmptyState("Could not load advisor requests.");
            return;
        }

        const result = JSON.parse(text);

        if (!result.success || !result.data || result.data.length === 0) {
            renderEmptyState("No advisor requests found.");
            return;
        }

        tableBody.innerHTML = "";

        result.data.forEach(request => {
            const row = document.createElement("tr");

            const status = (request.status || "").toUpperCase();

            let badgeClass = "pending";
            let icon = "fa-rotate-right";
            let statusText = "Pending";

            if (status === "ACCEPTED") {
                badgeClass = "accepted";
                icon = "fa-circle-check";
                statusText = "Accepted";
            }

            if (status === "REJECTED") {
                badgeClass = "rejected";
                icon = "fa-xmark";
                statusText = "Rejected";
            }

            const withdrawButton =
                status === "PENDING"
                    ? `
                    <button class="withdraw-btn" data-request-id="${request.id}">
                        Withdraw
                    </button>
                `
                    : "";

            row.innerHTML = `
                <td>
                    <div class="table-flex">
                        <i class="fa-regular fa-circle-user"></i>
                        <span>${request.advisorName || "-"}</span>
                    </div>
                </td>

                <td>
                    <div class="table-flex">
                        <i class="fa-regular fa-rectangle-list"></i>
                        <span>${request.projectTitle || "-"}</span>
                    </div>
                </td>

                <td>
                    <div class="status-area">
                        <span class="status-badge ${badgeClass}">
                            <i class="fa-solid ${icon}"></i>
                            ${statusText}
                        </span>

                        ${withdrawButton}
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        const withdrawButtons = document.querySelectorAll(".withdraw-btn");

        withdrawButtons.forEach(button => {
            button.addEventListener("click", async function () {
                const requestId = this.dataset.requestId;
                await withdrawRequest(requestId, token);
            });
        });

    } catch (error) {
        console.error("Advisor requests load error:", error);
        renderEmptyState("Server error while loading advisor requests.");
    }
}

function renderEmptyState(message) {
    const tableBody = document.getElementById("advisorRequestsTableBody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="3" class="empty-row">
                ${message}
            </td>
        </tr>
    `;
}

async function withdrawRequest(requestId, token) {
    try {
        /*
          Bunu da backend endpoint'inize göre değiştirin.
          Büyük ihtimalle:
          DELETE /api/advisor-requests/{id}
        */

        const response = await fetch(
            `${API_BASE}/api/advisor-requests/${requestId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            alert("Failed to withdraw request.");
            return;
        }

        const button = document.querySelector(`[data-request-id="${requestId}"]`);

        if (button) {
            const row = button.closest("tr");

            row.style.transition = "all 0.3s ease";
            row.style.opacity = "0";

            setTimeout(() => {
                row.remove();

                const remainingRows = document.querySelectorAll("#advisorRequestsTableBody tr");

                if (remainingRows.length === 0) {
                    renderEmptyState("No advisor requests found.");
                }
            }, 300);
        }

    } catch (error) {
        console.error("Withdraw error:", error);
        alert("Server error while withdrawing request.");
    }
}