"""
Ratings & Tags API endpoints
Handles user ratings and tags for movies
"""

from flask import Blueprint, jsonify, request, current_app

ratings_bp = Blueprint('ratings', __name__)


# ============================
# RATINGS ENDPOINTS
# ============================

@ratings_bp.route('/ratings', methods=['POST'])
def add_rating():
    """
    Add or update a rating
    Body: {
        "userId": int (required),
        "movieId": int (required),
        "rating": float (required, 0.5-5.0)
    }
    """
    try:
        db = current_app.db_manager
        data = request.get_json()
        
        # Validate required fields
        if not data or 'userId' not in data or 'movieId' not in data or 'rating' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: userId, movieId, rating'
            }), 400
        
        user_id = int(data['userId'])
        movie_id = int(data['movieId'])
        rating = float(data['rating'])
        
        # Validate rating value (MovieLens uses 0.5 to 5.0 scale)
        if not (0.5 <= rating <= 5.0):
            return jsonify({
                'success': False,
                'error': 'Rating must be between 0.5 and 5.0'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        # Add rating
        success = db.add_rating(user_id, movie_id, rating)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Rating added successfully',
                'data': {
                    'userId': user_id,
                    'movieId': movie_id,
                    'rating': rating,
                    'movie_title': movie['title']
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to add rating'
            }), 500
        
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


@ratings_bp.route('/ratings/user/<int:user_id>', methods=['GET'])
def get_user_ratings(user_id):
    """
    Get all ratings by a specific user
    Query params:
        - sort_by (str): rating, timestamp, title (default: timestamp)
        - order (str): asc, desc (default: desc)
        - page (int): Page number
        - per_page (int): Items per page
    """
    try:
        db = current_app.db_manager
        sort_by = request.args.get('sort_by', 'timestamp', type=str)
        order = request.args.get('order', 'desc', type=str)
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        ratings = db.get_user_ratings(user_id)
        
        # Sort ratings
        if sort_by in ['rating', 'timestamp', 'title']:
            reverse = (order == 'desc')
            ratings = sorted(ratings, key=lambda x: x.get(sort_by, 0), reverse=reverse)
        
        # Calculate statistics
        avg_rating = None
        if ratings:
            avg_rating = round(sum(r['rating'] for r in ratings) / len(ratings), 2)
        
        # Pagination
        total = len(ratings)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_ratings = ratings[start:end]
        
        return jsonify({
            'success': True,
            'data': paginated_ratings,
            'ratings': paginated_ratings,  # Keep for backward compatibility
            'user_id': user_id,
            'username': user.get('username', ''),
            'stats': {
                'total_ratings': total,
                'average_rating': avg_rating
            },
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_items': total,
                'total_pages': (total + per_page - 1) // per_page if per_page > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ratings_bp.route('/ratings/movie/<int:movie_id>', methods=['GET'])
def get_movie_ratings(movie_id):
    """
    Get all ratings for a specific movie
    Query params:
        - page (int): Page number
        - per_page (int): Items per page
    """
    try:
        db = current_app.db_manager
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        ratings = db.get_movie_ratings(movie_id)
        
        # Calculate statistics
        if ratings:
            rating_values = [r['rating'] for r in ratings]
            stats = {
                'count': len(ratings),
                'average': round(sum(rating_values) / len(rating_values), 2),
                'min': min(rating_values),
                'max': max(rating_values),
                'distribution': {
                    '5': sum(1 for r in rating_values if r >= 4.5),
                    '4': sum(1 for r in rating_values if 3.5 <= r < 4.5),
                    '3': sum(1 for r in rating_values if 2.5 <= r < 3.5),
                    '2': sum(1 for r in rating_values if 1.5 <= r < 2.5),
                    '1': sum(1 for r in rating_values if r < 1.5)
                }
            }
        else:
            stats = {
                'count': 0,
                'average': None,
                'min': None,
                'max': None,
                'distribution': {
                    '5': 0,
                    '4': 0,
                    '3': 0,
                    '2': 0,
                    '1': 0
                }
            }
        
        # Pagination
        total = len(ratings)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_ratings = ratings[start:end]
        
        return jsonify({
            'success': True,
            'data': paginated_ratings,
            'ratings': paginated_ratings,  # Keep for backward compatibility
            'movie_id': movie_id,
            'movie_title': movie.get('title', ''),
            'stats': stats,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_items': total,
                'total_pages': (total + per_page - 1) // per_page if per_page > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ratings_bp.route('/ratings/<int:user_id>/<int:movie_id>', methods=['DELETE'])
def delete_rating(user_id, movie_id):
    """
    Delete a rating
    """
    try:
        db = current_app.db_manager
        
        if db.ratings_df is None or db.ratings_df.empty:
            return jsonify({
                'success': False,
                'error': 'No ratings data available'
            }), 404
        
        existing = db.ratings_df[
            (db.ratings_df['userId'] == user_id) & 
            (db.ratings_df['movieId'] == movie_id)
        ]
        
        if existing.empty:
            return jsonify({
                'success': False,
                'error': 'Rating not found'
            }), 404
        
        db.ratings_df = db.ratings_df.drop(existing.index).reset_index(drop=True)
        
        # Save to file
        try:
            from config import RATINGS_FILE
            db.ratings_df.to_csv(RATINGS_FILE, index=False)
        except:
            pass  # If config not available, just keep in memory
        
        return jsonify({
            'success': True,
            'message': 'Rating deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================
# TAGS ENDPOINTS
# ============================

@ratings_bp.route('/tags', methods=['POST'])
def add_tag():
    """
    Add a tag to a movie
    Body: {
        "userId": int (required),
        "movieId": int (required),
        "tag": string (required)
    }
    """
    try:
        db = current_app.db_manager
        data = request.get_json()
        
        # Validate required fields
        if not data or 'userId' not in data or 'movieId' not in data or 'tag' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: userId, movieId, tag'
            }), 400
        
        user_id = int(data['userId'])
        movie_id = int(data['movieId'])
        tag = data['tag'].strip()
        
        if not tag:
            return jsonify({
                'success': False,
                'error': 'Tag cannot be empty'
            }), 400
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        # Add tag
        success = db.add_tag(user_id, movie_id, tag)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Tag added successfully',
                'data': {
                    'userId': user_id,
                    'movieId': movie_id,
                    'tag': tag,
                    'movie_title': movie.get('title', '')
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to add tag'
            }), 500
        
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


@ratings_bp.route('/tags/user/<int:user_id>', methods=['GET'])
def get_user_tags(user_id):
    """
    Get all tags created by a specific user
    Query params:
        - page (int): Page number
        - per_page (int): Items per page
    """
    try:
        db = current_app.db_manager
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Verify user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': f'User with ID {user_id} not found'
            }), 404
        
        tags = db.get_user_tags(user_id)
        
        # Pagination
        total = len(tags)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_tags = tags[start:end]
        
        return jsonify({
            'success': True,
            'data': paginated_tags,
            'tags': paginated_tags,  # Keep for backward compatibility
            'user_id': user_id,
            'username': user.get('username', ''),
            'count': total,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_items': total,
                'total_pages': (total + per_page - 1) // per_page if per_page > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ratings_bp.route('/tags/movie/<int:movie_id>', methods=['GET'])
def get_movie_tags(movie_id):
    """
    Get all tags for a specific movie
    Query params:
        - page (int): Page number
        - per_page (int): Items per page
    """
    try:
        db = current_app.db_manager
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Verify movie exists
        movie = db.get_movie_by_id(movie_id)
        if not movie:
            return jsonify({
                'success': False,
                'error': f'Movie with ID {movie_id} not found'
            }), 404
        
        tags = db.get_movie_tags(movie_id)
        
        # Count tag frequencies
        tag_counts = {}
        for tag_entry in tags:
            tag = tag_entry['tag'].lower()
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Create tag cloud data
        tag_cloud = sorted(
            [{'tag': tag, 'count': count} for tag, count in tag_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )
        
        # Pagination for detailed tags
        total = len(tags)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_tags = tags[start:end]
        
        return jsonify({
            'success': True,
            'data': paginated_tags,
            'tags': paginated_tags,  # Keep for backward compatibility
            'movie_id': movie_id,
            'movie_title': movie.get('title', ''),
            'tag_cloud': tag_cloud[:20],  # Top 20 most frequent tags
            'count': total,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_items': total,
                'total_pages': (total + per_page - 1) // per_page if per_page > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ratings_bp.route('/tags/popular', methods=['GET'])
def get_popular_tags():
    """
    Get most popular tags across all movies
    Query params:
        - n (int): Number of tags to return (default: 20)
    """
    try:
        db = current_app.db_manager
        n = request.args.get('n', 20, type=int)
        
        if db.tags_df is None or db.tags_df.empty:
            return jsonify({
                'success': True,
                'data': [],
                'tags': [],
                'count': 0
            }), 200
        
        # Count all tags
        tag_counts = {}
        for _, row in db.tags_df.iterrows():
            tag = str(row['tag']).lower().strip()
            if tag:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort and get top n
        popular_tags = sorted(
            [{'tag': tag, 'count': count} for tag, count in tag_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:n]
        
        return jsonify({
            'success': True,
            'data': popular_tags,
            'tags': popular_tags,  # Keep for backward compatibility
            'count': len(popular_tags)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500