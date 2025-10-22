// app.js – Main SPA logic for Epic Cinema

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Epic Cinema initialized");

  // Initialize navigation between SPA pages
  setupNavigation();

  // Initialize search functionality if present
  if (typeof setupSearch === "function") setupSearch();

  // Load initial content (popular or featured movies)
  if (typeof loadFeaturedMovies === "function") loadFeaturedMovies();

  // Update nav links and session state for logged-in user
  if (typeof initAuthOnSpaLoad === "function") initAuthOnSpaLoad();
});

// ----------------------
// SPA Navigation
// ----------------------
function setupNavigation() {
  const links = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");

  links.forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const targetPage = e.target.dataset.page;
      if (!targetPage) return;

      // Hide all pages
      pages.forEach(p => p.classList.remove("active"));

      // Show the target page
      const el = document.getElementById(targetPage);
      if (el) el.classList.add("active");

      // Load dynamic content based on page
      if (targetPage === "recommendations" && typeof loadPersonalizedRecommendations === "function") {
        await loadPersonalizedRecommendations();
      }

      if (targetPage === "profile") {
        const user = getCurrentUser();
        if (user && typeof loadUserProfile === "function") {
          loadUserProfile(user.id);
        }
      }
    });
  });

  // Logo click navigates to home page
  const logo = document.getElementById("logo");
  if (logo) {
    logo.addEventListener("click", e => {
      e.preventDefault();
      pages.forEach(p => p.classList.remove("active"));
      const homePage = document.getElementById("home");
      if (homePage) homePage.classList.add("active");
    });
  }
}
