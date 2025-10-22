"""
Configuration file for Movie Recommendation System
Contains all configuration parameters and file paths
"""

import os

# ============================
# BASE CONFIGURATION
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# ============================
# DATA FILE PATHS
# ============================
# Required files
MOVIES_FILE = os.path.join(DATA_DIR, 'movies.csv')
RATINGS_FILE = os.path.join(DATA_DIR, 'ratings.csv')

# Optional files
LINKS_FILE = os.path.join(DATA_DIR, 'links.csv')
TAGS_FILE = os.path.join(DATA_DIR, 'tags.csv')
USERS_FILE = os.path.join(DATA_DIR, 'users.csv')

# ============================
# RECOMMENDATION MODEL SETTINGS
# ============================
N_RECOMMENDATIONS = 10  # Default number of recommendations to return
MIN_RATINGS = 10  # Minimum number of ratings for a movie to be considered

# ============================
# API SERVER CONFIGURATION
# ============================
HOST = '0.0.0.0'  # Server host (0.0.0.0 = accessible from network)
PORT = 5000       # Server port
DEBUG = True      # Debug mode (set to False in production)

# Keep legacy names for backward compatibility
API_HOST = HOST
API_PORT = PORT

# ============================
# SECURITY SETTINGS
# ============================
SECRET_KEY = 'your-secret-key-here-change-in-production'  # Change this in production!
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max request size

# ============================
# CORS SETTINGS
# ============================
CORS_ORIGINS = [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
    "http://localhost:8080"   # Vue default
]

# ============================
# LOGGING CONFIGURATION
# ============================
LOG_LEVEL = 'INFO'  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT = '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'

# ============================
# CACHE SETTINGS
# ============================
CACHE_ENABLED = True
CACHE_TIMEOUT = 300  # Cache timeout in seconds (5 minutes)

# ============================
# PAGINATION SETTINGS
# ============================
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# ============================
# RECOMMENDATION ALGORITHM WEIGHTS
# ============================
# Weights for hybrid recommendation algorithm
HYBRID_WEIGHTS = {
    'collaborative': 0.4,  # User-based collaborative filtering
    'item_based': 0.3,     # Item-based collaborative filtering
    'content_based': 0.2,  # Content-based filtering (genres)
    'popularity': 0.1      # Popularity-based
}

# ============================
# SIMILARITY THRESHOLDS
# ============================
MIN_SIMILARITY_THRESHOLD = 0.1  # Minimum similarity score to consider
TOP_SIMILAR_USERS = 50          # Number of similar users to consider

# ============================
# VALIDATION
# ============================
def validate_config():
    """Validate that required files exist"""
    required_files = {
        'Movies': MOVIES_FILE,
        'Ratings': RATINGS_FILE
    }
    
    missing_files = []
    for name, path in required_files.items():
        if not os.path.exists(path):
            missing_files.append(f"{name}: {path}")
    
    if missing_files:
        print("⚠️  Warning: Required files not found:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure the data files are in the correct location.")
        return False
    
    return True


def print_config():
    """Print current configuration"""
    print("\n" + "="*60)
    print("⚙️  Configuration")
    print("="*60)
    print(f"📂 Data Directory: {DATA_DIR}")
    print(f"🎬 Movies File: {os.path.basename(MOVIES_FILE)}")
    print(f"⭐ Ratings File: {os.path.basename(RATINGS_FILE)}")
    print(f"🔗 Links File: {os.path.basename(LINKS_FILE)} {'✓' if os.path.exists(LINKS_FILE) else '✗'}")
    print(f"🏷️  Tags File: {os.path.basename(TAGS_FILE)} {'✓' if os.path.exists(TAGS_FILE) else '✗'}")
    print(f"👤 Users File: {os.path.basename(USERS_FILE)} {'✓' if os.path.exists(USERS_FILE) else '✗'}")
    print(f"\n🌐 Server: http://{HOST}:{PORT}")
    print(f"🔧 Debug Mode: {'Enabled' if DEBUG else 'Disabled'}")
    print(f"📊 Min Ratings: {MIN_RATINGS}")
    print(f"🎯 Default Recommendations: {N_RECOMMENDATIONS}")
    print("="*60 + "\n")


# Auto-validate on import (optional, can be commented out)
if __name__ == '__main__':
    print_config()
    validate_config()