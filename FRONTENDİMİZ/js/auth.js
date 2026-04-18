const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

async function loginUser() {
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter e-mail and password.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
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
    console.log("LOGIN RESPONSE:", result);

    if (!response.ok || !result.success) {
      alert(result.message || "Invalid e-mail or password.");
      return;
    }

    const authData = result.data;

    if (!authData || !authData.token || !authData.role || !authData.userId) {
      alert("Login response is incomplete.");
      return;
    }

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
}

loginBtn.addEventListener("click", loginUser);

passwordInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    loginUser();
  }
});

emailInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    loginUser();
  }
});