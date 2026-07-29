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
    const response = await fetch("https://project-advisor-system.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const text = await response.text();

let result = null;

try {
  result = text ? JSON.parse(text) : null;
} catch (e) {
  console.log("Login response parse failed:", text);
}

console.log("LOGIN RESPONSE:", result || text);

if (!response.ok || !result || !result.success) {
  const message = String(
    result?.message ||
    result?.error ||
    result?.detail ||
    text ||
    ""
  ).toLowerCase();

  console.log("LOGIN ERROR STATUS:", response.status);
  console.log("LOGIN ERROR MESSAGE:", message);
  console.log("LOGIN RAW ERROR:", text);

  if (
    message.includes("inactive") ||
    message.includes("pasif") ||
    message.includes("your account is inactive")
  ) {
    alert("Your account is inactive!");
  } else {
    alert("Invalid e-mail or password!");
  }

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
