document.getElementById("loginBtn").addEventListener("click", async function () {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter e-mail and password.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Invalid e-mail or password.");
      return;
    }

    const authData = result.data;

    localStorage.setItem("token", authData.token);
    localStorage.setItem("role", authData.role);
    localStorage.setItem("userId", authData.userId);

    if (authData.role === "STUDENT") {
      window.location.href = "pages/student/st-home.html";
    } else if (authData.role === "ADVISOR") {
      window.location.href = "pages/advisor/ins-home.html";
    } else if (authData.role === "ADMIN") {
      window.location.href = "pages/admin/ad-home.html";
    } else {
      alert("Unknown role.");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Server error. Please try again.");
  }
});