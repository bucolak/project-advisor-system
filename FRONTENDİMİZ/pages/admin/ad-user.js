const API_BASE = "http://localhost:8080";

let allUsers = [];

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  document.getElementById("userSearchInput").addEventListener("input", renderFilteredUsers);
  document.getElementById("roleSelect").addEventListener("change", renderFilteredUsers);

  await loadUsers(token);
});

async function loadUsers(token) {
  const tbody = document.getElementById("userTableBody");

  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await response.text();
    console.log("USERS STATUS:", response.status);
    console.log("USERS RESPONSE:", text);

    if (!response.ok) {
      tbody.innerHTML = `<tr><td colspan="5">Could not load users.</td></tr>`;
      return;
    }

    const result = JSON.parse(text);
    allUsers = result.data || result || [];

    renderFilteredUsers();

  } catch (error) {
    console.error("Users load error:", error);
    tbody.innerHTML = `<tr><td colspan="5">Server error while loading users.</td></tr>`;
  }
}

function renderFilteredUsers() {
  const tbody = document.getElementById("userTableBody");
  const searchValue = document.getElementById("userSearchInput").value.toLowerCase().trim();
  const selectedRole = document.getElementById("roleSelect").value;

  const filtered = allUsers.filter(user => {
    const fullName = getFullName(user).toLowerCase();
    const userRole = String(user.role || "").toLowerCase();

    const matchesSearch = fullName.includes(searchValue);
    const matchesRole = selectedRole === "all" || userRole === selectedRole;

    return matchesSearch && matchesRole;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  filtered.forEach(user => {
    const tr = document.createElement("tr");
    tr.className = "user-row";

    const fullName = getFullName(user);
    const role = String(user.role || "-").toLowerCase();
    const roleLabel = formatRole(role);
    const department = user.department || user.studentDepartment || user.advisorDepartment || "-";
    const status = String(user.status || "ACTIVE").toUpperCase();
    const createdAt = formatDate(user.createdAt || user.created_at);

    tr.innerHTML = `
      <td>
        <div class="admin-user-name-cell">
          <div class="admin-user-profile-icon">
            <i class="fa-regular fa-circle-user"></i>
          </div>
          <span>${fullName}</span>
        </div>
      </td>

      <td>
        <span class="admin-user-role ${role}">
          ${roleLabel}
        </span>
      </td>

      <td>${department}</td>

      <td>
        <button class="admin-user-status-toggle ${status === "ACTIVE" ? "active" : "inactive"}" data-user-id="${user.id || user.userId}">
          ${status === "ACTIVE" ? "Active" : "Inactive"}
        </button>
      </td>

      <td>${createdAt}</td>
    `;

    tbody.appendChild(tr);
  });

  setupStatusButtons();
}

function setupStatusButtons() {
  const token = localStorage.getItem("token");
  const buttons = document.querySelectorAll(".admin-user-status-toggle");

  buttons.forEach(button => {
    button.addEventListener("click", async function () {
      const userId = this.dataset.userId;
      const currentActive = this.classList.contains("active");
      const newStatus = currentActive ? "INACTIVE" : "ACTIVE";

      /*
        Eğer backend'de status update endpoint yoksa bu fetch'i silebiliriz.
        Muhtemel endpoint:
        PUT /api/admin/users/{userId}/status
      */

      try {
        const response = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        });

        if (!response.ok) {
          alert("Failed to update user status.");
          return;
        }

        this.classList.toggle("active", newStatus === "ACTIVE");
        this.classList.toggle("inactive", newStatus !== "ACTIVE");
        this.textContent = newStatus === "ACTIVE" ? "Active" : "Inactive";

      } catch (error) {
        console.error("Status update error:", error);
        alert("Server error while updating user status.");
      }
    });
  });
}

function getFullName(user) {
  if (user.fullName) return user.fullName;
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "-";
}

function formatRole(role) {
  if (role === "admin") return "Admin";
  if (role === "student") return "Student";
  if (role === "advisor") return "Advisor";
  return role || "-";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}