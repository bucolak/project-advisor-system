const API_BASE = "http://localhost:8080";

let advisorRequired = true;

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized");
    window.location.href = "../../index.html";
    return;
  }

  await loadAdminInfo(token, userId);
  setupAdvisorToggle();

  document
    .getElementById("createCategoryForm")
    .addEventListener("submit", submitCategory);
});

async function loadAdminInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const users = result.data || result || [];

    const admin = users.find(
      u =>
        String(u.id) === String(userId) ||
        String(u.userId) === String(userId)
    );

    if (!admin) return;

    const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim();

    document.getElementById("adminTopName").textContent = fullName || "Admin";
  } catch (e) {
    console.error(e);
  }
}

function setupAdvisorToggle() {
  const yes = document.getElementById("advisorYes");
  const no = document.getElementById("advisorNo");

  yes.addEventListener("click", () => {
    advisorRequired = true;
    yes.classList.add("active");
    no.classList.remove("active");
  });

  no.addEventListener("click", () => {
    advisorRequired = false;
    no.classList.add("active");
    yes.classList.remove("active");
  });
}

async function submitCategory(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const payload = {
    name: document.getElementById("categoryName").value.trim(),
    description: document.getElementById("categoryDescription").value.trim(),
    teamSize: document.getElementById("teamSize").value.trim(),
    budget: Number(document.getElementById("budget").value || 0),
    advisorRequired: advisorRequired
  };

  if (!payload.name) {
    alert("Category name required.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("CREATE CATEGORY STATUS:", response.status);
    console.log("CREATE CATEGORY RESPONSE:", text);

    if (!response.ok) {
      alert("Category creation failed.");
      return;
    }

    alert("Category created successfully.");
    window.location.href = "ad-projectcat.html";
  } catch (error) {
    console.error(error);
    alert("Server error.");
  }
}