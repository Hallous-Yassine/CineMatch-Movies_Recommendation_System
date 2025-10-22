"""
Recommendations API endpoints
Handles all recommendation algorithms for MovieLens dataset
"""

from flask import Blueprint, jsonify, request, current_app

recommendations_bp = Blueprint('recommendations', __name__)


@recommendations_bp.route('/recommendations/content/<int:movie_id>', methods=['GET'])
def get_content_recommendations(movie_id):
    """
    Get content-based recommendations (similar genres)
    Query params: n (number of recommendations, default=10)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        # Validate n
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        recommendations = recommender.get_content_based_recommendations(movie_id, n=n)
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'movie_id': movie_id,
            'movie_title': movie['title'],
            'method': 'content-based (genre similarity)'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/item/<int:movie_id>', methods=['GET'])
def get_item_recommendations(movie_id):
    """
    Get item-based collaborative filtering recommendations
    Query params: n (number of recommendations, default=10)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        recommendations = recommender.get_item_based_recommendations(movie_id, n=n)
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'movie_id': movie_id,
            'movie_title': movie['title'],
            'method': 'item-based collaborative filtering'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/collaborative/<int:user_id>', methods=['GET'])
def get_collaborative_recommendations(user_id):
    """
    Get user-based collaborative filtering recommendations
    Query params: n (number of recommendations, default=10)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        recommendations = recommender.get_collaborative_recommendations(user_id, n=n)
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'user_id': user_id,
            'username': user['username'],
            'method': 'user-based collaborative filtering'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/popular', methods=['GET'])
def get_popular_recommendations():
    """
    Get popular movies recommendations
    Query params: n (number of recommendations, default=10)
    """
    try:
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        recommendations = recommender.get_popular_recommendations(n=n)
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'method': 'popularity-based (weighted rating)'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/hybrid/<int:user_id>', methods=['GET'])
def get_hybrid_recommendations(user_id):
    """
    Get hybrid recommendations (combines multiple methods)
    Query params: 
        - n (number of recommendations, default=10)
        - movie_id (optional, for content-based boost)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        movie_id = request.args.get('movie_id', None, type=int)
        
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        # Verify movie if provided
        if movie_id:
            movie = db.get_movie_by_id(movie_id)
            if not movie:
                return jsonify({
                    'success': False,
                    'error': f'Movie with ID {movie_id} not found'
                }), 404
        
        recommendations = recommender.get_hybrid_recommendations(
            user_id, 
            movie_id=movie_id, 
            n=n
        )
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'user_id': user_id,
            'username': user['username'],
            'movie_id': movie_id,
            'method': 'hybrid (collaborative + content + popularity)'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/personalized/<int:user_id>', methods=['GET'])
def get_personalized_recommendations(user_id):
    """
    Get personalized recommendations based on user's viewing history
    Automatically selects the best method based on user data
    Query params: n (number of recommendations, default=10)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        if n <= 0 or n > 100:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 100'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        # Check user's rating history
        user_ratings = db.get_user_ratings(user_id)
        
        if not user_ratings:
            # New user - return popular movies
            recommendations = recommender.get_popular_recommendations(n=n)
            method = 'popular (new user)'
        elif len(user_ratings) < 5:
            # Few ratings - use hybrid with emphasis on popularity
            recommendations = recommender.get_hybrid_recommendations(user_id, n=n)
            method = 'hybrid (limited data)'
        else:
            # Established user - use full hybrid
            # Get user's most recently rated movie for content boost
            recent_movie = max(user_ratings, key=lambda x: x.get('timestamp', 0))
            movie_id = recent_movie['movieId']
            
            recommendations = recommender.get_hybrid_recommendations(
                user_id, 
                movie_id=movie_id, 
                n=n
            )
            method = 'hybrid (full personalization)'
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'user_id': user_id,
            'username': user['username'],
            'method': method,
            'user_rating_count': len(user_ratings)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/compare', methods=['POST'])
def compare_methods():
    """
    Compare different recommendation methods for a user
    Body: {
        "userId": int (required),
        "movieId": int (optional),
        "n": int (optional, default=5)
    }
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        data = request.get_json()
        
        if not data or 'userId' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: userId'
            }), 400
        
        user_id = int(data['userId'])
        movie_id = data.get('movieId', None)
        n = data.get('n', 5)
        
        if n <= 0 or n > 50:
            return jsonify({
                'success': False,
                'error': 'Parameter n must be between 1 and 50'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        results = {
            'user_id': user_id,
            'username': user['username'],
            'movie_id': movie_id,
            'methods': {}
        }
        
        # User-based collaborative filtering
        results['methods']['collaborative'] = recommender.get_collaborative_recommendations(user_id, n=n)
        
        # Popular recommendations
        results['methods']['popular'] = recommender.get_popular_recommendations(n=n)
        
        # If movie_id provided, add content and item-based
        if movie_id:
            movie = db.get_movie_by_id(movie_id)
            if movie:
                results['movie_title'] = movie['title']
                results['methods']['content_based'] = recommender.get_content_based_recommendations(movie_id, n=n)
                results['methods']['item_based'] = recommender.get_item_based_recommendations(movie_id, n=n)
        
        # Hybrid
        results['methods']['hybrid'] = recommender.get_hybrid_recommendations(user_id, movie_id=movie_id, n=n)
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid data type: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@recommendations_bp.route('/recommendations/similar-users/<int:user_id>', methods=['GET'])
def get_similar_users(user_id):
    """
    Find users with similar tastes
    Query params: n (number of users, default=10)
    """
    try:
        db = current_app.db_manager
        recommender = current_app.recommender
        n = request.args.get('n', 10, type=int)
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        if recommender.user_similarity_df is None:
            return jsonify({
                'success': False,
                'error': 'User similarity data not available'
            }), 404
        
        if user_id not in recommender.user_similarity_df.index:
            return jsonify({
                'success': False,
                'error': f'User {user_id} not in similarity matrix (may have no ratings)'
            }), 404
        
        # Get similar users
        similar_users = recommender.user_similarity_df[user_id].sort_values(ascending=False)
        
        # Exclude the user themselves
        similar_users = similar_users[similar_users.index != user_id]
        
        # Filter out very low similarity
        similar_users = similar_users[similar_users > 0.1]
        
        # Get top n similar users
        similar_users = similar_users.head(n)
        
        # Build response with user info
        result = []
        for similar_user_id, similarity_score in similar_users.items():
            similar_user = db.get_user_by_id(similar_user_id)
            if similar_user:
                # Get common movies
                user_ratings = db.get_user_ratings(user_id)
                similar_ratings = db.get_user_ratings(similar_user_id)
                
                user_movies = set(r['movieId'] for r in user_ratings)
                similar_movies = set(r['movieId'] for r in similar_ratings)
                common_movies = len(user_movies & similar_movies)
                
                result.append({
                    'user_id': similar_user_id,
                    'username': similar_user['username'],
                    'similarity_score': round(float(similarity_score), 3),
                    'common_movies': common_movies
                })
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result),
            'user_id': user_id,
            'username': user['username']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500