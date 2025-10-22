"""
Main API Routes Registration
Registers and documents all API blueprints for the Flask application.
"""

from flask import jsonify
from flask_cors import CORS

# Import Blueprints
from .movies import movies_bp
from .ratings import ratings_bp
from .recommendations import recommendations_bp
from .users import users_bp


def register_routes(app):
    """Register all API blueprints and configure CORS and error handlers."""
    
    # ===============================
    # CORS CONFIGURATION
    # ===============================
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:*", "http://127.0.0.1:*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # ===============================
    # BLUEPRINT REGISTRATION
    # ===============================
    app.register_blueprint(movies_bp, url_prefix='/api')
    app.register_blueprint(ratings_bp, url_prefix='/api')
    app.register_blueprint(recommendations_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api')

    # ===============================
    # API DOCUMENTATION ENDPOINT
    # ===============================
    @app.route('/api/docs', methods=["GET"])
    def api_docs():
        """Return detailed API documentation as JSON."""
        return jsonify({
            "title": "Movie Recommendation System API",
            "version": "1.0.0",
            "description": "RESTful API for a MovieLens-based movie recommendation system.",
            "base_url": "/api",
            "endpoints": {
                "Movies": {
                    "GET /api/movies": "Get all movies (paginated)",
                    "GET /api/movies/<id>": "Get movie details by ID",
                    "GET /api/movies/search": "Search movies by title (params: q, page, per_page)",
                    "GET /api/movies/genre/<genre>": "Get movies by genre (params: page, per_page)",
                    "GET /api/movies/popular": "Get popular movies (params: n, min_ratings)",
                    "GET /api/movies/<id>/similar": "Get similar movies (params: n)",
                    "GET /api/genres": "List all genres with movie counts"
                },
                "Users": {
                    "POST /api/users": "Create a new user",
                    "POST /api/users/authenticate": "Authenticate user (login)",
                    "GET /api/users": "Get all users (paginated)",
                    "GET /api/users/<id>": "Get user profile summary",
                    "GET /api/users/<id>/profile": "Get detailed user profile with preferences"
                },
                "Ratings": {
                    "POST /api/ratings": "Add or update a rating",
                    "GET /api/ratings/user/<id>": "Get ratings by user",
                    "GET /api/ratings/movie/<id>": "Get ratings for a movie"
                },
                "Tags": {
                    "POST /api/tags": "Add a tag to a movie",
                    "GET /api/tags/user/<id>": "Get all tags by user",
                    "GET /api/tags/movie/<id>": "Get all tags for a movie",
                    "GET /api/tags/popular": "Get most popular tags"
                },
                "Recommendations": {
                    "GET /api/recommendations/content/<movie_id>": "Content-based recommendations (by genre)",
                    "GET /api/recommendations/item/<movie_id>": "Item-based collaborative filtering",
                    "GET /api/recommendations/collaborative/<user_id>": "User-based collaborative filtering",
                    "GET /api/recommendations/popular": "Get globally popular movies",
                    "GET /api/recommendations/hybrid/<user_id>": "Hybrid recommendations (combined methods)",
                    "POST /api/recommendations/compare": "Compare multiple recommendation methods",
                    "GET /api/recommendations/similar-users/<user_id>": "Find users with similar tastes"
                }
            },
            "common_parameters": {
                "page": "Page number (default: 1)",
                "per_page": "Items per page (default: 20, max: 100)",
                "n": "Number of recommendations (default: 10)",
                "q": "Search query string",
                "sort_by": "Sorting field (e.g., title, rating, timestamp)",
                "order": "Sort order: asc | desc"
            },
            "response_format": {
                "success": True,
                "data": "...",
                "pagination": "... (if applicable)"
            },
            "error_format": {
                "success": False,
                "error": "Error message"
            },
            "data_sources": {
                "movies.csv": "Movie metadata (movieId, title, genres)",
                "ratings.csv": "User ratings (userId, movieId, rating, timestamp)",
                "tags.csv": "User tags (userId, movieId, tag, timestamp)",
                "links.csv": "IMDb/TMDb links (movieId, imdbId, tmdbId)",
                "users.csv": "User accounts (id, username, firstname, lastname, password)"
            }
        }), 200

    # ===============================
    # ERROR HANDLERS
    # ===============================
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": getattr(error, "description", "Invalid request syntax")
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "The requested endpoint does not exist",
            "documentation": "/api/docs"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "Method Not Allowed",
            "message": "The HTTP method used is not supported for this endpoint"
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred on the server"
        }), 500

    # ===============================
    # STARTUP LOG
    # ===============================
    print("✓ API routes registered successfully")
    print("  - /api/movies/*")
    print("  - /api/users/*")
    print("  - /api/ratings/*")
    print("  - /api/tags/*")
    print("  - /api/recommendations/*")
    print("  - Docs available at: /api/docs")

    return app
