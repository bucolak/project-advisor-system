const API_BASE = "https://project-advisor-system.onrender.com";

let originalFirstName = "";
let originalLastName = "";
let originalTitle = "";
let originalEmail = "";
let originalDepartment = "";

document.addEventListener("DOMContentLoaded", async function () {
  setupInterestAdder();
  setupSaveButton();

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
});

function setupInterestAdder() {
  const addInterestBtn = document.getElementById("addInterestBtn");
  const list = document.getElementById("researchInterestList");

  if (!addInterestBtn || !list) return;

  addInterestBtn.addEventListener("click", function () {
    const li = document.createElement("li");
    li.innerHTML = `<input type="text" placeholder="Enter new research interest" />`;
    list.appendChild(li);
  });
}

function setupSaveButton() {
  const saveBtn = document.getElementById("advisorSaveBtn");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async function () {
    const token = localStorage.getItem("token");

    await updateAdvisorProfile(token);
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

    const text = await response.text();

    if (!response.ok) {
      alert(`Failed to load advisor profile. Status: ${response.status}`);
      return;
    }

    const result = JSON.parse(text);

    if (!result.success || !result.data) {
      alert(result.message || "Failed to load advisor profile.");
      return;
    }

    const advisor = result.data;

    const firstName = advisor.firstName || "";
    const lastName = advisor.lastName || "";
    const fullNameWithoutTitle = `${firstName} ${lastName}`.trim();
    const fullName = `Dr. ${fullNameWithoutTitle}`.trim();

    renderTopbar("topbarArea", fullName || "Advisor", "Advisor");

    document.getElementById("advisorDisplayName").textContent =
      fullName || "Advisor";

    originalFirstName = firstName;
    originalLastName = lastName;
    originalTitle = advisor.title || "";
    originalEmail = advisor.email || "";
    originalDepartment = advisor.department || "";

    const fullNameInput = document.getElementById("fullName");
    const titleInput = document.getElementById("title");
    const emailInput = document.getElementById("email");
    const departmentInput = document.getElementById("department");

    fullNameInput.value = fullNameWithoutTitle;
    titleInput.value = originalTitle;
    emailInput.value = originalEmail;
    departmentInput.value = originalDepartment;

    fullNameInput.readOnly = true;
    titleInput.readOnly = true;
    emailInput.readOnly = true;
    departmentInput.readOnly = true;

    fullNameInput.classList.add("readonly-field");
    titleInput.classList.add("readonly-field");
    emailInput.classList.add("readonly-field");
    departmentInput.classList.add("readonly-field");

    document.getElementById("areasOfExpertise").value =
      advisor.areasOfExpertise || "";

    renderResearchInterests(advisor.researchInterests);

  } catch (error) {
    console.error("Advisor edit profile load error:", error);
    alert("Server error while loading advisor profile.");
  }
}

async function updateAdvisorProfile(token) {
  const payload = {
    areasOfExpertise: document.getElementById("areasOfExpertise").value.trim(),
    researchInterests: getResearchInterestsText()
  };

  try {
    const response = await fetch(`${API_BASE}/api/advisors/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("UPDATE ADVISOR PROFILE STATUS:", response.status);
    console.log("UPDATE ADVISOR PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert("Advisor profile could not be updated.");
      return;
    }

    alert("Advisor profile updated successfully.");
    window.location.href = "ins-profile.html";

  } catch (error) {
    console.error("Advisor profile update error:", error);
    alert("Server error while updating advisor profile.");
  }
}

function renderResearchInterests(researchValue) {
  const list = document.getElementById("researchInterestList");
  list.innerHTML = "";

  let researchItems = [];

  if (Array.isArray(researchValue)) {
    researchItems = researchValue;
  } else if (typeof researchValue === "string" && researchValue.trim() !== "") {
    researchItems = researchValue
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (!researchItems.length) {
    list.innerHTML = `<li><input type="text" placeholder="Enter research interest" /></li>`;
    return;
  }

  researchItems.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="text" value="${escapeHtml(item)}" />`;
    list.appendChild(li);
  });
}

function getResearchInterestsText() {
  const inputs = document.querySelectorAll("#researchInterestList input");

  return Array.from(inputs)
    .map(input => input.value.trim())
    .filter(Boolean)
    .join(", ");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


