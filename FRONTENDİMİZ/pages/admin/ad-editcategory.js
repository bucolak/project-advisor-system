const API_BASE = "https://project-advisor-system.onrender.com";

let advisorRequired = false;
let categoryId = null;
let currentCategory = null;

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
  categoryId = params.get("id");

  if (!categoryId) {
    alert("Category id not found.");
    window.location.href = "ad-projectcat.html";
    return;
  }

  renderSidebar(role);
  setupAdvisorToggle();

  await loadAdminInfo(token, userId);
  await loadCategory(token, categoryId);

  setupFormSubmit(token);
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

    if (fullName) {
      renderTopbar("topbarArea", fullName, "Admin");

      const adminTopName = document.getElementById("adminTopName");
      if (adminTopName) {
        adminTopName.textContent = fullName;
      }
    }

  } catch (error) {
    console.error("Admin load error:", error);
  }
}

async function loadCategory(token, id) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert("Category could not be loaded.");
      return;
    }

    const result = await response.json();
    currentCategory = result.data || result;

    const categoryNameInput = document.getElementById("categoryName");
    const categoryDescriptionInput = document.getElementById("categoryDescription");
    const teamSizeInput = document.getElementById("teamSize");
    const budgetInput = document.getElementById("budget");

    if (categoryNameInput) {
      categoryNameInput.placeholder = currentCategory.name || "";
    }

    if (categoryDescriptionInput) {
      categoryDescriptionInput.placeholder = currentCategory.description || "No description";
    }

    if (teamSizeInput) {
      teamSizeInput.placeholder = currentCategory.teamSize || "No team size";
    }

    if (budgetInput) {
      budgetInput.placeholder = currentCategory.budget ?? "No budget";
    }

    const categoryName = String(currentCategory.name || "").toUpperCase();

    const advisorBox = document.getElementById("advisorRequiredBox");
    const budgetFieldBox = document.getElementById("budgetFieldBox");
    const form = document.getElementById("editCategoryForm");

    const isCourseCategory = categoryName === "COURSE";

    if (isCourseCategory) {
      advisorRequired = false;

      if (budgetFieldBox) {
        budgetFieldBox.style.display = "none";
      }

      if (advisorBox) {
        advisorBox.style.display = "none";
      }

      if (form) {
        form.classList.add("course-edit-mode");
      }

      return;
    }

    if (budgetFieldBox) {
      budgetFieldBox.style.display = "flex";
    }

    if (advisorBox) {
      advisorBox.style.display = "block";
    }

    if (form) {
      form.classList.remove("course-edit-mode");
    }

    advisorRequired = Boolean(currentCategory.advisorRequired);
    updateAdvisorButtons();

  } catch (error) {
    console.error("Category load error:", error);
    alert("Server error while loading category.");
  }
}

function setupAdvisorToggle() {
  const yesBtn = document.getElementById("advisorYes");
  const noBtn = document.getElementById("advisorNo");

  if (!yesBtn || !noBtn) return;

  yesBtn.addEventListener("click", function () {
    advisorRequired = true;
    updateAdvisorButtons();
  });

  noBtn.addEventListener("click", function () {
    advisorRequired = false;
    updateAdvisorButtons();
  });
}

function updateAdvisorButtons() {
  const yesBtn = document.getElementById("advisorYes");
  const noBtn = document.getElementById("advisorNo");

  if (!yesBtn || !noBtn) return;

  if (advisorRequired) {
    yesBtn.classList.add("active");
    noBtn.classList.remove("active");
  } else {
    noBtn.classList.add("active");
    yesBtn.classList.remove("active");
  }
}

function setupFormSubmit(token) {
  const form = document.getElementById("editCategoryForm");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!currentCategory) {
      alert("Category data is not loaded yet.");
      return;
    }

    const nameInput = document.getElementById("categoryName").value.trim();
    const descriptionInput = document.getElementById("categoryDescription").value.trim();
    const teamSizeInput = document.getElementById("teamSize").value.trim();
    const budgetInput = document.getElementById("budget").value;

    const finalCategoryName = nameInput || currentCategory.name;
    const isCourseCategory = String(finalCategoryName || "").toUpperCase() === "COURSE";

    const payload = {
      name: finalCategoryName,
      description: descriptionInput || currentCategory.description || "",
      teamSize: teamSizeInput || currentCategory.teamSize || "",
      budget: isCourseCategory
        ? null
        : (budgetInput !== "" ? Number(budgetInput) : (currentCategory.budget ?? 0)),
      advisorRequired: isCourseCategory ? false : advisorRequired
    };

    if (!payload.name) {
      alert("Category name is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        alert("Category update failed.");
        return;
      }

      alert("Category updated successfully.");
      window.location.href = "ad-projectcat.html";

    } catch (error) {
      console.error("Category update error:", error);
      alert("Server error while updating category.");
    }
  });
}
