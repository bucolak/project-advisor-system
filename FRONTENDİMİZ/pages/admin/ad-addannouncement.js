const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdminInfo(token, userId);
  setupAnnouncementForm(token);
});

async function loadAdminInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const users = result.data || result || [];

    const admin = users.find(user =>
      String(user.id) === String(userId) ||
      String(user.userId) === String(userId)
    );

    if (!admin) return;

    const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim();

    if (fullName) {
      document.getElementById("adminTopName").textContent = fullName;
    }

  } catch (error) {
    console.error("Admin info load error:", error);
  }
}

function setupAnnouncementForm(token) {
  document.getElementById("announcementForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("announcementTitle").value.trim();
    const category = document.getElementById("announcementCategory").value;
    const deadline = document.getElementById("announcementDeadline").value;
    const type = document.getElementById("announcementType").value;
    const description = document.getElementById("announcementDescription").value.trim();

    if (!title || !category || !deadline || !type || !description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          category,
          deadline,
          type,
          description
        })
      });

      const text = await response.text();
      console.log("ADD ANNOUNCEMENT STATUS:", response.status);
      console.log("ADD ANNOUNCEMENT RESPONSE:", text);

      if (!response.ok) {
        alert("Failed to publish announcement.");
        return;
      }

      alert("Announcement published successfully.");
      window.location.href = "ad-announce.html";

    } catch (error) {
      console.error("Add announcement error:", error);
      alert("Server error while publishing announcement.");
    }
  });
}