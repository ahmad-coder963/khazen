const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");

if (navToggle && topbar) {
  navToggle.addEventListener("click", () => {
    topbar.classList.toggle("nav-open");
  });
}
