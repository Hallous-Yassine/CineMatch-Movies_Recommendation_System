// api.js – Communicate with Flask backend
const API_BASE = "http://127.0.0.1:5000/api"; // adjust if backend runs elsewhere

// ----------------------
// Movies
// ----------------------

// ✅ GET /api/movies — Get all movies (paginated)
export async function fetchMovies(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/movies?${query}`);
    return res.ok ? await res.json() : { success: false, error: "Failed to fetch movies" };
  } catch (err) {
    console.error("fetchMovies error:", err);
    return { success: false, error: err.message };
  }
}

// ✅ GET /api/movies/<id> — Get movie details by ID
export async function fetchMovieById(id) {
  try {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    return res.ok ? await res.json() : { success: false, error: "Movie not found" };
  } catch (err) {
    console.error("fetchMovieById error:", err);
    return { success: false, error: err.message };
  }
}

// ✅ GET /api/movies/search?q=title — Search movies by title
export async function searchMovies(q, params = {}) {
  try {
    const query = new URLSearchParams({ q, ...params }).toString();
    const res = await fetch(`${API_BASE}/movies/search?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("searchMovies error:", err);
    return [];
  }
}

// ✅ GET /api/movies/genre/<genre> — Get movies by genre
export async function fetchMoviesByGenre(genre, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/movies/genre/${encodeURIComponent(genre)}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchMoviesByGenre error:", err);
    return [];
  }
}

// ✅ GET /api/movies/popular — Get popular movies
export async function fetchPopularMovies(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/movies/popular?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchPopularMovies error:", err);
    return [];
  }
}

// ✅ GET /api/movies/<id>/similar — Get similar movies
export async function fetchSimilarMovies(id, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/movies/${id}/similar?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchSimilarMovies error:", err);
    return [];
  }
}

// ✅ GET /api/genres — List all genres with movie counts
export async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    const data = await res.json();
    return res.ok ? data.data || data || [] : [];
  } catch (err) {
    console.error("fetchGenres error:", err);
    return [];
  }
}

// ----------------------
// Ratings
// ----------------------
async function addOrUpdateRating(userId, movieId, rating) {
  try {
    const res = await fetch(`${API_BASE}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, movie_id: movieId, rating })
    });
    const data = await res.json();
    return res.ok ? data.message || "Rating saved successfully" : "Error saving rating";
  } catch (err) {
    console.error("addOrUpdateRating error:", err);
    return "Network error while saving rating";
  }
}

async function fetchUserRatings(userId) {
  try {
    const res = await fetch(`${API_BASE}/ratings/user/${userId}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchUserRatings error:", err);
    return [];
  }
}

async function fetchMovieRatings(movieId) {
  try {
    const res = await fetch(`${API_BASE}/ratings/movie/${movieId}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchMovieRatings error:", err);
    return [];
  }
}


// ----------------------
// Tags
// ----------------------
async function addTag(userId, movieId, tag) {
  try {
    const res = await fetch(`${API_BASE}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, movie_id: movieId, tag })
    });
    const data = await res.json();
    return res.ok ? data.message || "Tag added successfully" : "Error adding tag";
  } catch (err) {
    console.error("addTag error:", err);
    return "Network error while adding tag";
  }
}

async function fetchUserTags(userId) {
  try {
    const res = await fetch(`${API_BASE}/tags/user/${userId}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchUserTags error:", err);
    return [];
  }
}

async function fetchMovieTags(movieId) {
  try {
    const res = await fetch(`${API_BASE}/tags/movie/${movieId}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchMovieTags error:", err);
    return [];
  }
}

async function fetchPopularTags(limit = 10) {
  try {
    const res = await fetch(`${API_BASE}/tags/popular?limit=${limit}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchPopularTags error:", err);
    return [];
  }
}



// ----------------------
// Recommendations
// ----------------------

// ✅ GET /api/recommendations/content/<movie_id>
// Content-based recommendations (based on movie genre/tags)
export async function fetchContentRecommendations(movieId, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/content/${movieId}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchContentRecommendations error:", err);
    return [];
  }
}

// ✅ GET /api/recommendations/item/<movie_id>
// Item-based collaborative filtering
export async function fetchItemBasedRecommendations(movieId, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/item/${movieId}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchItemBasedRecommendations error:", err);
    return [];
  }
}

// ✅ GET /api/recommendations/collaborative/<user_id>
// User-based collaborative filtering
export async function fetchCollaborativeRecommendations(userId, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/collaborative/${userId}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchCollaborativeRecommendations error:", err);
    return [];
  }
}

// ✅ GET /api/recommendations/popular
// Get globally popular movies
export async function fetchPopularRecommendations(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/popular?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchPopularRecommendations error:", err);
    return [];
  }
}

// ✅ GET /api/recommendations/hybrid/<user_id>
// Hybrid recommendations (combined collaborative + content)
export async function fetchHybridRecommendations(userId, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/hybrid/${userId}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchHybridRecommendations error:", err);
    return [];
  }
}

// ✅ POST /api/recommendations/compare
// Compare multiple recommendation methods (e.g., content vs collaborative)
export async function compareRecommendationMethods(methodsPayload) {
  try {
    const res = await fetch(`${API_BASE}/recommendations/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(methodsPayload),
    });
    const data = await res.json();
    return res.ok ? data.results || data.data || [] : [];
  } catch (err) {
    console.error("compareRecommendationMethods error:", err);
    return [];
  }
}

// ✅ GET /api/recommendations/similar-users/<user_id>
// Find users with similar tastes
export async function fetchSimilarUsers(userId, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/recommendations/similar-users/${userId}?${query}`);
    const data = await res.json();
    return res.ok ? data.data || [] : [];
  } catch (err) {
    console.error("fetchSimilarUsers error:", err);
    return [];
  }
}


// ----------------------
// Users (Auth & Profiles)
// ----------------------

// ✅ POST /api/users — Create a new user
export async function apiRegisterUser(user) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const payload = await res.json();

    if (payload && (payload.user || payload.data)) {
      return { success: payload.success !== false, data: payload.user || payload.data };
    }
    return payload;
  } catch (err) {
    console.error("apiRegisterUser error:", err);
    return { success: false, error: err.message };
  }
}

// ✅ POST /api/users/authenticate — Authenticate user (login)
export async function apiAuthenticateUser(credentials) {
  try {
    const res = await fetch(`${API_BASE}/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const payload = await res.json();

    if (payload && (payload.user || payload.data)) {
      return { success: payload.success !== false, data: payload.user || payload.data };
    }
    return payload;
  } catch (err) {
    console.error("apiAuthenticateUser error:", err);
    return { success: false, error: err.message };
  }
}

// ✅ GET /api/users — Get all users (paginated)
export async function apiGetAllUsers(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${query}`);
    const data = await res.json();
    return res.ok ? data.data || data.users || [] : [];
  } catch (err) {
    console.error("apiGetAllUsers error:", err);
    return [];
  }
}

// ✅ GET /api/users/<id> — Get user profile summary
export async function apiGetUserSummary(userId) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    const payload = await res.json();
    if (!res.ok) return null;
    if (payload && payload.user) return payload.user;
    if (payload && payload.data) return payload.data;
    return null;
  } catch (err) {
    console.error("apiGetUserSummary error:", err);
    return null;
  }
}

// ✅ GET /api/users/<id>/profile — Get detailed user profile with preferences
export async function apiGetUserProfile(userId) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`);
    const payload = await res.json();
    if (!res.ok) return null;
    if (payload && payload.profile) return payload.profile;
    if (payload && payload.user) return payload.user;
    if (payload && payload.data) return payload.data;
    return null;
  } catch (err) {
    console.error("apiGetUserProfile error:", err);
    return null;
  }
}

