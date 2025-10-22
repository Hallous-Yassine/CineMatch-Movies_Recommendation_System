"""
API package initialization
Exports all API blueprints
"""

from .movies import movies_bp
from .ratings import ratings_bp
from .recommendations import recommendations_bp
from .users import users_bp

__all__ = ['movies_bp', 'ratings_bp', 'recommendations_bp', 'users_bp']