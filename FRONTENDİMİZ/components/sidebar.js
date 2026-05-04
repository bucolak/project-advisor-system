function renderSidebar(role) {
  const container = document.getElementById("sidebarArea");
  if (!container) return;

  const currentPage = window.location.pathname.split("/").pop();

  const menus = {
    ADMIN: [
      {
        text: "Home",
        href: "ad-home.html",
        icon: "fa-solid fa-house"
      },
      {
        text: "Project Categories",
        href: "ad-projectcat.html",
        icon: "fa-regular fa-folder-open",
        activePages: [
          "ad-projectcat.html",
          "ad-addcategory.html",
          "ad-editcategory.html",
          "ad-category-edit.html"
        ]
      },
      {
        text: "Announcements & Dates",
        href: "ad-announce.html",
        icon: "fa-regular fa-flag",
        activePages: [
          "ad-announce.html",
          "ad-addannounce.html",
          "ad-addannouncement.html",
          "ad-editannounce.html",
          "ad-editannouncement.html",
          "ad-announcement-edit.html"
        ]
      },
      {
        text: "User Management",
        href: "ad-user.html",
        icon: "fa-regular fa-user"
      }
    ],

    STUDENT: [
      {
        text: "Home",
        href: "st-home.html",
        icon: "fa-solid fa-house"
      },
      {
        text: "My Projects",
        href: "st-projects.html",
        icon: "fa-solid fa-briefcase",
        activePages: [
          "st-projects.html",
          "project-details.html"
        ]
      },
      {
        text: "Create Project",
        href: "st-createprojects.html",
        icon: "fa-regular fa-square-plus"
      },
      {
        text: "Advisor Requests",
        href: "st-advisorrequests.html",
        icon: "fa-regular fa-rectangle-list"
      },
      {
        text: "Advisors",
        href: "st-advisors.html",
        icon: "fa-regular fa-user"
      },
      {
        text: "Notifications",
        href: "st-notifications.html",
        icon: "fa-regular fa-bell"
      },
      {
        text: "Profile",
        href: "st-profile.html",
        icon: "fa-regular fa-circle-user",
        activePages: [
          "st-profile.html",
          "student-profile-edit.html",
          "st-profile-edit.html"
        ]
      }
    ],

    ADVISOR: [
      {
        text: "Home",
        href: "ins-home.html",
        icon: "fa-solid fa-house"
      },
      {
        text: "Requests",
        href: "ins.request.html",
        icon: "fa-regular fa-user",
        activePages: [
          "ins.request.html",
          "ins-request.html"
        ]
      },
      {
        text: "Notifications",
        href: "ins-notification.html",
        icon: "fa-regular fa-bell"
      },
      {
        text: "Profile",
        href: "ins-profile.html",
        icon: "fa-regular fa-circle-user",
        activePages: [
          "ins-profile.html",
          "ins-profile-edit.html",
          "advisor-profile-edit.html"
        ]
      }
    ]
  };

  const menuItems = menus[role] || [];

  container.innerHTML = `
    <aside class="global-sidebar">
      <div class="global-sidebar-top">
        <i class="fa-solid fa-up-down-left-right"></i>
      </div>

      <ul class="global-sidebar-menu">
        ${menuItems.map(item => {
          const isActive =
            currentPage === item.href ||
            (item.activePages && item.activePages.includes(currentPage));

          return `
            <li>
              <a href="${item.href}" class="${isActive ? "active" : ""}">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
              </a>
            </li>
          `;
        }).join("")}
      </ul>
    </aside>
  `;
}