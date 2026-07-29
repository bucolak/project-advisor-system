const API_BASE = "https://project-advisor-system.onrender.com";

let currentAnnouncementId = null;
let currentAnnouncement = null;
let parsedOldAnnouncement = null;

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!token || !userId || role !== "ADMIN") {
    alert("Unauthorized access.");
    window.location.href = "../../index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  currentAnnouncementId = params.get("id");

  if (!currentAnnouncementId) {
    alert("Announcement id not found.");
    window.location.href = "ad-announce.html";
    return;
  }

  renderSidebar(role);

  await loadAdminInfo(token, userId);
  await loadCategories(token);
  await loadAnnouncementTypes(token);
  await loadAnnouncementDetail(token, currentAnnouncementId);

  setupEditAnnouncementForm(token);
});

async function loadAdminInfo(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
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

    renderTopbar("topbarArea", fullName || "Admin", "Admin");

    const adminTopName = document.getElementById("adminTopName");
    if (adminTopName) adminTopName.textContent = fullName || "Admin";

  } catch (error) {
    console.error("Admin info load error:", error);
  }
}

async function loadCategories(token) {
  const select = document.getElementById("announcementCategory");

  try {
    const response = await fetch(`${API_BASE}/api/admin/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      select.innerHTML = `<option value="">Could not load categories</option>`;
      return;
    }

    const result = await response.json();
    const categories = result.data || result || [];

    select.innerHTML = `<option value="">Select a project type</option>`;

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      option.dataset.id = category.id;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Category load error:", error);
    select.innerHTML = `<option value="">Server error</option>`;
  }
}

async function loadAnnouncementTypes(token) {
  const select = document.getElementById("announcementType");

  try {
    const response = await fetch(`${API_BASE}/api/admin/announcement-types`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      select.innerHTML = `<option value="">Could not load announcement types</option>`;
      return;
    }

    const result = await response.json();
    const types = result.data || result || [];

    select.innerHTML = `<option value="">Select announcement type</option>`;

    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type.name;
      option.textContent = type.name;
      option.dataset.id = type.id;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Announcement type load error:", error);
    select.innerHTML = `<option value="">Server error</option>`;
  }
}

async function loadAnnouncementDetail(token, id) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/announcements`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await response.text();

    console.log("EDIT ANN LIST STATUS:", response.status);
    console.log("EDIT ANN LIST RESPONSE:", text);

    if (!response.ok) {
      alert("Announcement detail could not be loaded.");
      window.location.href = "ad-announce.html";
      return;
    }

    const result = JSON.parse(text);
    const announcements = result.data || result || [];

    const announcement = announcements.find(item =>
      String(item.id || item.announcementId) === String(id)
    );

    if (!announcement) {
      alert("Announcement not found.");
      window.location.href = "ad-announce.html";
      return;
    }

    currentAnnouncement = announcement;
    fillEditForm(announcement);

  } catch (error) {
    console.error("Announcement detail load error:", error);
    alert("Server error while loading announcement detail.");
  }
}

function fillEditForm(announcement) {
  parsedOldAnnouncement = parseAnnouncementData(announcement);

  const titleInput = document.getElementById("announcementTitle");
  const categorySelect = document.getElementById("announcementCategory");
  const deadlineInput = document.getElementById("announcementDeadline");
  const typeSelect = document.getElementById("announcementType");
  const descriptionInput = document.getElementById("announcementDescription");

  titleInput.value = "";
  titleInput.placeholder = parsedOldAnnouncement.title || "Enter announcement title";

  descriptionInput.value = "";
  descriptionInput.placeholder = parsedOldAnnouncement.description || "Enter detailed description";

  deadlineInput.value = formatDateForInput(parsedOldAnnouncement.deadline);

  setSelectByTextOrValue(categorySelect, parsedOldAnnouncement.category);
  setSelectByTextOrValue(typeSelect, parsedOldAnnouncement.type);
}

function parseAnnouncementData(announcement) {
  const rawDescription = announcement.description || announcement.content || "";

  const parsed = {
    title: announcement.title || "",
    category: announcement.category || announcement.categoryName || "",
    deadline: announcement.deadline || "",
    type: announcement.type || announcement.announcementType || "",
    description: rawDescription
  };

  const lines = String(rawDescription).split("\n");

  lines.forEach(line => {
    const clean = line.trim();

    if (clean.toLowerCase().startsWith("category:")) {
      parsed.category = clean.replace(/category:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("type:")) {
      parsed.type = clean.replace(/type:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("deadline:")) {
      parsed.deadline = clean.replace(/deadline:/i, "").trim();
    }

    if (clean.toLowerCase().startsWith("description:")) {
      parsed.description = clean.replace(/description:/i, "").trim();
    }
  });

  return parsed;
}

function setSelectByTextOrValue(select, value) {
  if (!select || !value) return;

  const normalizedValue = normalizeText(value);

  const matchedOption = Array.from(select.options).find(option =>
    normalizeText(option.value) === normalizedValue ||
    normalizeText(option.textContent) === normalizedValue
  );

  if (matchedOption) {
    select.value = matchedOption.value;
  }
}

function setupEditAnnouncementForm(token) {
  const form = document.getElementById("editAnnouncementForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!currentAnnouncement || !parsedOldAnnouncement) {
      alert("Announcement data is not loaded yet.");
      return;
    }

    const titleInput = document.getElementById("announcementTitle").value.trim();
    const categoryInput = document.getElementById("announcementCategory").value;
    const deadlineInput = document.getElementById("announcementDeadline").value;
    const typeInput = document.getElementById("announcementType").value;
    const descriptionInput = document.getElementById("announcementDescription").value.trim();

    const payload = {
      title: titleInput || parsedOldAnnouncement.title,
      category: categoryInput || parsedOldAnnouncement.category,
      deadline: deadlineInput || parsedOldAnnouncement.deadline,
      type: typeInput || parsedOldAnnouncement.type,
      description: descriptionInput || parsedOldAnnouncement.description
    };

    if (!payload.title || !payload.category || !payload.deadline || !payload.type || !payload.description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${currentAnnouncementId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();

      console.log("UPDATE ANNOUNCEMENT STATUS:", response.status);
      console.log("UPDATE ANNOUNCEMENT RESPONSE:", text);

      if (!response.ok) {
        alert("Announcement could not be updated.");
        return;
      }

      alert("Announcement updated successfully.");
      window.location.href = "ad-announce.html";

    } catch (error) {
      console.error("Announcement update error:", error);
      alert("Server error while updating announcement.");
    }
  });
}

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace("ü", "u")
    .replace("ı", "i")
    .replace("ö", "o")
    .replace("ğ", "g")
    .replace("ş", "s")
    .replace("ç", "c");
}
