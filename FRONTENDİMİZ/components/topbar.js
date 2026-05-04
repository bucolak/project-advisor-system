function renderTopbar(containerId, fullName, role) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = `
    <div class="global-topbar">
      <div class="global-user-dropdown">
        <div class="global-user-box" id="globalUserBox">
          <i class="fa-regular fa-circle-user"></i>

          <div class="global-user-info">
            <span>${fullName || "User"}</span>
            <small>${role || ""}</small>
          </div>

          <i class="fa-solid fa-chevron-down global-user-arrow" id="globalUserArrow"></i>
        </div>

        <div class="global-dropdown-menu" id="globalDropdownMenu">
          <a href="../../index.html" id="globalLogoutBtn">Log Out</a>
        </div>
      </div>
    </div>
  `;

  const userBox = document.getElementById("globalUserBox");
  const dropdown = document.getElementById("globalDropdownMenu");
  const arrow = document.getElementById("globalUserArrow");
  const logoutBtn = document.getElementById("globalLogoutBtn");

  if (!userBox || !dropdown) return;

  userBox.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    arrow.classList.toggle("rotate");
  });

  document.addEventListener("click", function (e) {
    if (!userBox.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
      arrow.classList.remove("rotate");
    }
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    
    window.location.href = "../../index.html";
  });
}