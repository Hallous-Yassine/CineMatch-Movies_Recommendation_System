// auth.js — login/signup helpers + session management for Epic Cinema

const APP_KEY = "epic_cinema_user";
let currentUser = null;

import { apiAuthenticateUser } from './api.js';

/* ---------- Session helpers ---------- */
export function saveUser(user) {
  if (!user) return;
  // don't persist sensitive fields
  const safe = { ...user };
  if (safe.password) delete safe.password;
  currentUser = safe;
  localStorage.setItem(APP_KEY, JSON.stringify(safe));
}

export function clearUser() {
  currentUser = null;
  localStorage.removeItem(APP_KEY);
}

export function getCurrentUser() {
  if (currentUser) return currentUser;
  const raw = localStorage.getItem(APP_KEY);
  if (!raw) return null;
  try {
    currentUser = JSON.parse(raw);
    return currentUser;
  } catch (e) {
    return null;
  }
}

/* ---------- Login form (login.html) ---------- */
export function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) return alert("Please enter username and password.");

    try {
      const resp = await apiAuthenticateUser({ username, password });
      if (resp.success) {
        saveUser(resp.data);
        window.location.href = "../pages/home.html"; // redirect to home
      } else {
        alert(resp.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  });
}

/* ---------- Signup form (signup.html) ---------- */
export function initSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const firstname = document.getElementById("signup-firstname").value.trim();
    const lastname = document.getElementById("signup-lastname").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!username || !password || !firstname || !lastname) {
      return alert("All fields are required.");
    }

    try {
      const resp = await apiRegisterUser({ username, firstname, lastname, password });
      if (resp.success) {
        alert("Account created. Please log in.");
        window.location.href = "login.html";
      } else {
        alert(resp.error || "Sign up failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  });
}

/* ---------- Navbar updates ---------- */
export function updateNavForAuth() {
  const user = getCurrentUser();
  const auth1 = document.getElementById("auth-link-1");
  const auth2 = document.getElementById("auth-link-2");

  if (!auth1 || !auth2) return;

  if (user) {
    auth1.innerHTML = `<a href="#" id="nav-profile-link">Hi, ${user.firstname}</a>`;
    auth2.innerHTML = `<a href="#" id="nav-logout-link">Logout</a>`;

    document.getElementById("nav-profile-link").onclick = (e) => {
      e.preventDefault();
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      document.getElementById("profile")?.classList.add("active");
      loadUserProfile(user.id);
    };

    document.getElementById("nav-logout-link").onclick = (e) => {
      e.preventDefault();
      clearUser();
      updateNavForAuth();
      window.location.href = "index.html";
    };
  } else {
    auth1.innerHTML = `<a href="login.html">Login</a>`;
    auth2.innerHTML = `<a href="signup.html">Sign Up</a>`;
  }
}

/* ---------- Load user profile ---------- */
export async function loadUserProfile(userId) {
  const container = document.getElementById("user-profile");
  if (!container) return;

  container.innerHTML = "<p>Loading profile...</p>";

  try {
    const profile = await apiGetUserProfile(userId);
    if (!profile) {
      container.innerHTML = "<p>Unable to load profile.</p>";
      return;
    }

    container.innerHTML = `
      <div class="profile-card">
        <h3>${profile.firstname} ${profile.lastname} (ID: ${profile.id})</h3>
        <p><strong>Total ratings:</strong> ${profile.total_ratings || 0}</p>
        <p><strong>Avg rating given:</strong> ${profile.avg_rating || "N/A"}</p>
        <h4>Top genres</h4>
        <ul>
          ${ (profile.favorite_genres || []).map(g => `<li>${g.genre} — ${parseFloat(g.avg_rating).toFixed(2)} (${g.count})</li>`).join('') }
        </ul>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading profile.</p>";
  }
}

/* ---------- Initialize on SPA load ---------- */
export function initAuthOnSpaLoad() {
  updateNavForAuth();
}
