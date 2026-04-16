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

  try {
    const response = await fetch(`${API_BASE}/api/students/${userId}/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("STATUS:", response.status);

    const text = await response.text();
    console.log("RAW HOME RESPONSE:", text);

    let result = {};
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.log("JSON parse error:", e);
    }

    if (!response.ok) {
      alert(result.message || "Failed to load student data.");
      return;
    }

    const profile = result.data;
    const fullName = `${profile.firstName} ${profile.lastName}`;

    document.getElementById("topProfileName").textContent = fullName;
    document.getElementById("topProfileRole").textContent = "Student";
    document.getElementById("welcomeText").textContent = `Welcome, ${profile.firstName} 👋`;
    document.getElementById("studentDepartment").textContent = profile.department || "";
    document.getElementById("studentYear").textContent = profile.year ?? "";
  } catch (error) {
    console.error("Student home load error:", error);
    alert("Server error while loading home page.");
  }
});