"""
Movies API endpoints (cleaned)
Uses current_app.db_manager provided by server initialization
"""

from flask import Blueprint, jsonify, request, current_app

movies_bp = Blueprint('movies', __name__)


@movies_bp.route('/movies', methods=['GET'])
def get_all_movies():
    try:
        db = current_app.db_manager
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        movies = db.get_all_movies() or []
        total = len(movies)
        page = movies[offset: offset + limit]

        return jsonify({'success': True, 'count': len(page), 'total': total, 'offset': offset, 'limit': limit, 'movies': page}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@movies_bp.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        db = current_app.db_manager
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({'success': False, 'error': 'Film non trouvé'}), 404

        # attach ratings info
        ratings = db.ratings_df[db.ratings_df['movieId'] == movie_id] if db.ratings_df is not None else None
        if ratings is not None and not ratings.empty:
            movie['avg_rating'] = round(float(ratings['rating'].mean()), 2)
            movie['num_ratings'] = int(len(ratings))
            movie['rating_distribution'] = {
                '5': int((ratings['rating'] == 5.0).sum()),
                '4': int(((ratings['rating'] >= 4.0) & (ratings['rating'] < 5.0)).sum()),
                '3': int(((ratings['rating'] >= 3.0) & (ratings['rating'] < 4.0)).sum()),
                '2': int(((ratings['rating'] >= 2.0) & (ratings['rating'] < 3.0)).sum()),
                '1': int((ratings['rating'] < 2.0).sum())
            }
        else:
            movie.update({'avg_rating': None, 'num_ratings': 0, 'rating_distribution': None})

        return jsonify({'success': True, 'movie': movie}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@movies_bp.route('/movies/search', methods=['GET'])
def search_movies():
    try:
        q = request.args.get('q', '').strip()
        limit = request.args.get('limit', 50, type=int)
        if not q:
            return jsonify({'success': False, 'error': 'q parameter is required'}), 400
        db = current_app.db_manager
        movies = db.search_movies(q)[:limit]
        return jsonify({'success': True, 'query': q, 'count': len(movies), 'movies': movies}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@movies_bp.route('/movies/genre/<genre>', methods=['GET'])
def get_movies_by_genre(genre):
    try:
        limit = request.args.get('limit', 50, type=int)
        if not genre.strip():
            return jsonify({'success': False, 'error': 'Genre cannot be empty'}), 400
        db = current_app.db_manager
        movies = db.get_movies_by_genre(genre)[:limit]
        return jsonify({'success': True, 'genre': genre, 'count': len(movies), 'movies': movies}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@movies_bp.route('/movies/popular', methods=['GET'])
def get_popular_movies():
    try:
        n = request.args.get('n', 10, type=int)
        db = current_app.db_manager
        movies = db.get_popular_movies(n)
        return jsonify({'success': True, 'count': len(movies), 'movies': movies}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@movies_bp.route('/movies/genres', methods=['GET'])
def get_all_genres():
    try:
        db = current_app.db_manager
        genres = db.get_all_genres()
        return jsonify({'success': True, 'count': len(genres), 'genres': genres}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
"""
Movies API endpoints
Handles movie-related operations
"""

from flask import Blueprint, jsonify, request
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from database.db_manager import DatabaseManager

movies_bp = Blueprint('movies', __name__)

# Initialize database manager
db = DatabaseManager()


@movies_bp.route('/movies', methods=['GET'])
def get_all_movies():
    """
    Get all movies with optional pagination
    Query params: page, per_page
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        movies = db.get_all_movies()
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        
        return jsonify({
            'success': True,
            'data': movies[start:end],
            'page': page,
            'per_page': per_page,
            'total': len(movies)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie_by_id(movie_id):
    """Get a specific movie by ID"""
    try:
        movie = db.get_movie_by_id(movie_id)
        
        if movie is None:
            return jsonify({
                'success': False,
                'error': 'Movie not found'
            }), 404
        
        # Add rating statistics
        avg_rating = db.get_movie_avg_rating(movie_id)
        ratings = db.get_movie_ratings(movie_id)
        
        movie['avg_rating'] = round(avg_rating, 2) if avg_rating else None
        movie['rating_count'] = len(ratings)
        
        # Add links if available
        links = db.get_movie_links(movie_id)
        if links:
            movie['imdb_url'] = db.get_imdb_url(movie_id)
            movie['tmdb_url'] = db.get_tmdb_url(movie_id)
        
        # Add tags if available
        tags = db.get_movie_tags(movie_id)
        if tags:
            movie['tags'] = [tag['tag'] for tag in tags]
        
        return jsonify({
            'success': True,
            'data': movie
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/search', methods=['GET'])
def search_movies():
    """
    Search movies by title
    Query params: q (query string), page, per_page
    """
    try:
        query = request.args.get('q', '', type=str)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400
        
        movies = db.search_movies(query)
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        
        return jsonify({
            'success': True,
            'data': movies[start:end],
            'page': page,
            'per_page': per_page,
            'total': len(movies),
            'query': query
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/genre/<string:genre>', methods=['GET'])
def get_movies_by_genre(genre):
    """
    Get movies by genre
    Query params: page, per_page
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        movies = db.get_movies_by_genre(genre)
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        
        return jsonify({
            'success': True,
            'data': movies[start:end],
            'page': page,
            'per_page': per_page,
            'total': len(movies),
            'genre': genre
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/popular', methods=['GET'])
def get_popular_movies():
    """
    Get popular movies
    Query params: n (number of movies), min_ratings (minimum rating count)
    """
    try:
        n = request.args.get('n', 10, type=int)
        min_ratings = request.args.get('min_ratings', 10, type=int)
        
        movies = db.get_popular_movies(n=n, min_ratings=min_ratings)
        
        return jsonify({
            'success': True,
            'data': movies,
            'count': len(movies)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/genres', methods=['GET'])
def get_all_genres():
    """Get all unique genres"""
    try:
        genres = db.get_all_genres()
        
        return jsonify({
            'success': True,
            'data': genres,
            'count': len(genres)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/<int:movie_id>/ratings', methods=['GET'])
def get_movie_ratings_endpoint(movie_id):
    """Get all ratings for a specific movie"""
    try:
        ratings = db.get_movie_ratings(movie_id)
        
        return jsonify({
            'success': True,
            'data': ratings,
            'count': len(ratings),
            'movie_id': movie_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@movies_bp.route('/movies/<int:movie_id>/tags', methods=['GET'])
def get_movie_tags_endpoint(movie_id):
    """Get all tags for a specific movie"""
    try:
        tags = db.get_movie_tags(movie_id)
        
        return jsonify({
            'success': True,
            'data': tags,
            'count': len(tags),
            'movie_id': movie_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500