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
});

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
    const fullName = `Dr. ${`${firstName} ${lastName}`.trim()}`.trim();

    renderTopbar("topbarArea", fullName, "Advisor");

    document.getElementById("advisorProfileName").textContent = fullName;
    document.getElementById("advisorDepartment").textContent = advisor.department || "-";
    document.getElementById("advisorTitle").textContent = advisor.title || "-";
    document.getElementById("advisorEmail").textContent = advisor.email || "-";

    renderExpertise(advisor.areasOfExpertise);
    renderResearch(advisor.researchInterests);

    await loadPreviouslySupervisedProjectTypes(token);

    const savedStatus = localStorage.getItem("advisorStatus");
    renderStatus(savedStatus || advisor.advisingStatus);

  } catch (error) {
    console.error("Advisor profile load error:", error);
    alert("Server error while loading advisor profile.");
  }
}