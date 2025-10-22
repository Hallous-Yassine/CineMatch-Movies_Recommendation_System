"""
Users blueprint - minimal functionality
Endpoints:
  POST /api/users                - create a user (username, firstname, lastname, password)
  POST /api/users/authenticate   - authenticate (username, password)
  GET  /api/users/<id>           - get basic user info
  GET  /api/users/<id>/profile   - get extended profile (ratings/tags)

Uses current_app.db_manager for persistence.
"""

from flask import Blueprint, request, jsonify, current_app

users_bp = Blueprint('users', __name__)


@users_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json(force=True)
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password required'}), 400

    db = current_app.db_manager
    
    # Check if user already exists
    existing_user = db.get_user_by_username(username)
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    # Create new user
    user = db.add_user(username, password)
    if not user:
        return jsonify({'success': False, 'message': 'Failed to create user'}), 500

    # Return consistent structure with data object
    return jsonify({
        'success': True,
        'message': 'User created successfully',
        'data': {
            'userId': user['id'],
            'username': user['username']
        }
    }), 201


@users_bp.route('/users/authenticate', methods=['POST'])
def authenticate_user():
    data = request.get_json(force=True)
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password required'}), 400

    db = current_app.db_manager
    user = db.authenticate_user(username, password)
    if not user:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    # Return consistent structure with data object
    return jsonify({
        'success': True, 
        'message': 'Authentication successful',
        'data': {
            'userId': user['id'],
            'username': user['username']
        }
    }), 200


@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    db = current_app.db_manager
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    return jsonify({'success': True, 'user': user}), 200


@users_bp.route('/users/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    db = current_app.db_manager
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    ratings = db.get_user_ratings(user_id)
    tags = db.get_user_tags(user_id)
    profile = {
        'user': user,
        'ratings': ratings,
        'tags': tags
    }
    return jsonify({'success': True, 'profile': profile}), 200
