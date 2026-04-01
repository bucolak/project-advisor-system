document.getElementById("loginBtn").addEventListener("click", function () {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter e-mail and password.");
    return;
  }

  if (email === "student@demo.com" && password === "1234") {
    window.location.href = "pages/student/st-home.html";
  } 
  else if (email === "advisor@demo.com" && password === "1234") {
    window.location.href = "pages/advisor/ins-home.html";
  } 
  else if (email === "admin@demo.com" && password === "1234") {
    window.location.href = "pages/admin/ad-home.html";
  } 
  else {
    alert("Invalid e-mail or password.");
  }
});