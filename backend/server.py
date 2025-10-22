"""
server.py - Point d'entrée de l'application Flask
Configure et démarre le serveur API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os
from datetime import datetime

# Ajouter le répertoire courant au path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import HOST, PORT, DEBUG
from database.db_manager import DatabaseManager
from model.recommender import MovieRecommender
from api.routes import register_routes

# Initialisation de l'application Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:*", "http://127.0.0.1:*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration de l'application
app.config['JSON_SORT_KEYS'] = False
app.config['JSON_AS_ASCII'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# Variables globales pour partager entre les routes
db_manager = None
recommender = None


def initialize_system():
    """Initialise la base de données et le système de recommandation"""
    global db_manager, recommender
    
    print("\n" + "="*60)
    print("🎬 Movie Recommendation System")
    print("="*60)
    
    try:
        print("\n🔄 Initialisation du système...")
        
        # Initialiser la base de données
        print("📊 Chargement de la base de données...")
        db_manager = DatabaseManager()
        
        if db_manager.movies_df is None or db_manager.ratings_df is None:
            raise Exception("Échec du chargement des données")
        
        print(f"   ✓ {len(db_manager.movies_df)} films chargés")
        print(f"   ✓ {len(db_manager.ratings_df)} notes chargées")
        
        if db_manager.users_df is not None:
            print(f"   ✓ {len(db_manager.users_df)} utilisateurs chargés")
        
        # Initialiser le système de recommandation
        print("🤖 Initialisation du système de recommandation...")
        recommender = MovieRecommender(db_manager.movies_df, db_manager.ratings_df)
        print("   ✓ Modèle de recommandation prêt")
        
        # Stocker dans l'app context
        app.db_manager = db_manager
        app.recommender = recommender
        
        print("\n✅ Système initialisé avec succès !")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erreur lors de l'initialisation: {str(e)}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        return False


@app.before_request
def log_request():
    """Log les requêtes entrantes"""
    if DEBUG:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {request.method} {request.path}")


@app.after_request
def add_headers(response):
    """Ajoute des headers de sécurité et cache"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response


@app.errorhandler(400)
def bad_request(error):
    """Gestion des erreurs 400"""
    return jsonify({
        'success': False,
        'error': 'Requête invalide',
        'message': str(error.description) if hasattr(error, 'description') else 'La requête est mal formée'
    }), 400


@app.errorhandler(404)
def not_found(error):
    """Gestion des erreurs 404"""
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'message': 'La ressource demandée n\'existe pas'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Gestion des erreurs 500"""
    if DEBUG:
        import traceback
        traceback.print_exc()
    
    return jsonify({
        'success': False,
        'error': 'Erreur interne du serveur',
        'message': 'Une erreur inattendue s\'est produite'
    }), 500


@app.route('/')
def home():
    """Page d'accueil de l'API avec documentation"""
    return jsonify({
        'name': 'Movie Recommendation System API',
        'version': '1.0.0',
        'description': 'API de recommandation de films basée sur MovieLens',
        'status': 'running',
        'endpoints': {
            'documentation': 'GET /api/docs',
            'health': 'GET /api/health',
            'movies': {
                'list': 'GET /api/movies',
                'details': 'GET /api/movies/<id>',
                'search': 'GET /api/movies/search?q=<query>',
                'by_genre': 'GET /api/movies/genre/<genre>',
                'popular': 'GET /api/movies/popular',
                'genres': 'GET /api/genres'
            },
            'recommendations': {
                'content_based': 'GET /api/recommendations/content/<movie_id>',
                'item_based': 'GET /api/recommendations/item/<movie_id>',
                'collaborative': 'GET /api/recommendations/collaborative/<user_id>',
                'hybrid': 'GET /api/recommendations/hybrid/<user_id>',
                'personalized': 'GET /api/recommendations/personalized/<user_id>',
                'popular': 'GET /api/recommendations/popular',
                'compare': 'POST /api/recommendations/compare'
            },
            'ratings': {
                'add': 'POST /api/ratings',
                'user_ratings': 'GET /api/ratings/user/<user_id>',
                'movie_ratings': 'GET /api/ratings/movie/<movie_id>'
            },
            'users': {
                'create': 'POST /api/users',
                'authenticate': 'POST /api/users/authenticate',
                'get_user': 'GET /api/users/<user_id>',
                'list_all': 'GET /api/users'
            }
        },
        'stats': {
            'total_movies': len(db_manager.movies_df) if db_manager else 0,
            'total_ratings': len(db_manager.ratings_df) if db_manager else 0,
            'total_users': len(db_manager.users_df) if db_manager and db_manager.users_df is not None else 0,
            'unique_raters': int(db_manager.ratings_df['userId'].nunique()) if db_manager and db_manager.ratings_df is not None else 0
        }
    })


@app.route('/api/health')
def health_check():
    """Endpoint de santé pour monitoring"""
    db_status = 'connected' if db_manager and db_manager.movies_df is not None else 'disconnected'
    rec_status = 'ready' if recommender and recommender.user_item_matrix is not None else 'not_ready'
    
    is_healthy = db_status == 'connected' and rec_status == 'ready'
    
    return jsonify({
        'status': 'healthy' if is_healthy else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'components': {
            'database': db_status,
            'recommender': rec_status
        },
        'stats': {
            'movies': len(db_manager.movies_df) if db_manager else 0,
            'ratings': len(db_manager.ratings_df) if db_manager else 0,
            'users': len(db_manager.users_df) if db_manager and db_manager.users_df is not None else 0
        }
    }), 200 if is_healthy else 503


def main():
    """Fonction principale pour démarrer le serveur"""
    
    # Initialiser le système
    if not initialize_system():
        print("❌ Impossible de démarrer le serveur sans données valides")
        print("⚠️  Veuillez vérifier vos fichiers de configuration et de données\n")
        return
    
    # Enregistrer les routes
    try:
        register_routes(app)
    except Exception as e:
        print(f"❌ Erreur lors de l'enregistrement des routes: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Afficher les informations de démarrage
    print("🚀 Serveur démarré avec succès !")
    print(f"📍 URL: http://{HOST}:{PORT}")
    print(f"📖 Documentation: http://{HOST}:{PORT}/")
    print(f"📚 API Docs: http://{HOST}:{PORT}/api/docs")
    print(f"🏥 Health Check: http://{HOST}:{PORT}/api/health")
    print(f"🔍 Mode Debug: {'Activé ⚠️' if DEBUG else 'Désactivé'}")
    print("\n💡 Appuyez sur CTRL+C pour arrêter le serveur\n")
    
    # Démarrer le serveur Flask
    try:
        app.run(
            host=HOST,
            port=PORT,
            debug=DEBUG,
            threaded=True,
            use_reloader=False  # Évite le double démarrage en mode debug
        )
    except KeyboardInterrupt:
        print("\n\n👋 Arrêt du serveur...")
        print("Merci d'avoir utilisé le système de recommandation !\n")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n❌ Le port {PORT} est déjà utilisé")
            print(f"💡 Essayez de changer le port dans config.py ou arrêtez l'autre processus\n")
        else:
            print(f"\n❌ Erreur système: {str(e)}\n")
    except Exception as e:
        print(f"\n❌ Erreur lors du démarrage: {str(e)}")
        if DEBUG:
            import traceback
            traceback.print_exc()
        print()


if __name__ == '__main__':
    main()