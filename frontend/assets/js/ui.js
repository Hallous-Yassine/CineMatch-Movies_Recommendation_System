// Add this to ui.js

function renderMovieGrid(container, movies) {
    container.innerHTML = "";
    if (!movies.length) {
        container.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster || 'placeholder.jpg'}" alt="${movie.title}">
            <h4>${movie.title}</h4>
        `;
        card.addEventListener("click", () => showMovieModal(movie));
        container.appendChild(card);
    });
}

function showMovieModal(movie) {
    const modal = document.createElement("div");
    modal.classList.add("movie-modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster || 'placeholder.jpg'}" alt="${movie.title}">
            <h2>${movie.title}</h2>
            <p><strong>Genres:</strong> ${movie.genres || "N/A"}</p>
            <p><strong>Overview:</strong> ${movie.overview || "No description available."}</p>
            <button class="rate-btn">⭐ Rate Movie</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}
