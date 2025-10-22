// -------------------------------------
// Handles Home page logic using api.js + ui.js
// -------------------------------------

import { fetchMovies, fetchHybridRecommendations, fetchPopularTags, searchMovies, fetchMoviesByGenre } from '../api.js';
import { renderMovieGrid } from '../ui.js';

const moviesContainer = document.getElementById("movies-container");
const recommendationsContainer = document.getElementById("recommendations-container");
const tagsContainer = document.getElementById("tags-container");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const userId = localStorage.getItem("user_id") || null;

// -------------------------------
// Load Movies, Recommendations, Tags
// -------------------------------

async function loadMovies() {
  const result = await fetchMovies();
  const movies = result.data || result || [];
  renderMovieGrid(moviesContainer, movies);
}

async function loadRecommendations() {
  if (!userId) {
    recommendationsContainer.innerHTML = `<p class="empty">Login to see personalized recommendations.</p>`;
    return;
  }

  const recs = await fetchHybridRecommendations(userId, { limit: 8 });
  renderMovieGrid(recommendationsContainer, recs);
}

async function loadTags() {
  const tags = await fetchPopularTags(10);
  renderTags(tags);
}

// -------------------------------
// Search
// -------------------------------

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return loadMovies();

  const results = await searchMovies(query);
  renderMovieGrid(moviesContainer, results);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// -------------------------------
// Tags
// -------------------------------

function renderTags(tags) {
  tagsContainer.innerHTML = "";
  if (!tags || !tags.length) {
    tagsContainer.innerHTML = "<p>No trending tags.</p>";
    return;
  }

  tags.forEach((t) => {
    const span = document.createElement("span");
    span.classList.add("tag-item");
    span.textContent = `#${t.tag || t}`;
    span.addEventListener("click", async () => {
      const genreMovies = await fetchMoviesByGenre(t.tag || t);
      renderMovieGrid(moviesContainer, genreMovies);
    });
    tagsContainer.appendChild(span);
  });
}

// -------------------------------
// Init Page
// -------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await loadMovies();
  await loadRecommendations();
  await loadTags();
});