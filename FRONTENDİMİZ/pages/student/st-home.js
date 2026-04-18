const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async function () {
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
});

async function loadStudentProfile(token, userId) {
  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("PROFILE STATUS:", response.status);

    const text = await response.text();
    console.log("RAW PROFILE RESPONSE:", text);

    if (!response.ok) {
      alert(`Failed to load student data. Status: ${response.status}`);
      return;
    }

    let result = {};
    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("JSON parse error:", error);
      alert("Invalid server response.");
      return;
    }

    if (!result.success) {
      alert(result.message || "Failed to load student data.");
      return;
    }

    const profile = result.data;
    if (!profile) {
      alert("Student profile data not found.");
      return;
    }

    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    document.getElementById("topProfileName").textContent = fullName || "Student";
    document.getElementById("topProfileRole").textContent = "Student";
    document.getElementById("welcomeText").textContent = `Welcome, ${firstName || "Student"} 👋`;
    document.getElementById("studentDepartment").textContent = profile.department || "-";
    document.getElementById("studentYear").textContent = profile.year ?? "-";
  } catch (error) {
    console.error("Student home load error:", error);
    alert("Server error while loading home page.");
  }
}