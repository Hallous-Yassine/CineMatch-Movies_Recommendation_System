"""
validators.py - Fonctions de validation pour les API
"""

def validate_movie_id(movie_id):
    """
    Valide l'ID d'un film
    
    Args:
        movie_id: ID du film à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if movie_id is None:
        return False, "L'ID du film est requis"
    
    try:
        movie_id = int(movie_id)
        if movie_id <= 0:
            return False, "L'ID du film doit être un nombre positif"
        return True, None
    except (ValueError, TypeError):
        return False, "L'ID du film doit être un nombre entier valide"


def validate_user_id(user_id):
    """
    Valide l'ID d'un utilisateur
    
    Args:
        user_id: ID de l'utilisateur à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if user_id is None:
        return False, "L'ID utilisateur est requis"
    
    try:
        user_id = int(user_id)
        if user_id <= 0:
            return False, "L'ID utilisateur doit être un nombre positif"
        return True, None
    except (ValueError, TypeError):
        return False, "L'ID utilisateur doit être un nombre entier valide"


def validate_search_query(query):
    """
    Valide une requête de recherche
    
    Args:
        query: Requête de recherche à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if not query or not isinstance(query, str):
        return False, "La requête de recherche doit être une chaîne de caractères non vide"
    
    if len(query.strip()) < 2:
        return False, "La requête de recherche doit contenir au moins 2 caractères"
    
    if len(query.strip()) > 200:
        return False, "La requête de recherche est trop longue (max 200 caractères)"
    
    return True, None


def validate_recommendation_count(count):
    """
    Valide le nombre de recommandations demandées
    
    Args:
        count: Nombre de recommandations à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if count is None:
        return False, "Le nombre de recommandations est requis"
    
    try:
        count = int(count)
        if count <= 0:
            return False, "Le nombre de recommandations doit être positif"
        if count > 100:
            return False, "Le nombre maximum de recommandations est limité à 100"
        return True, None
    except (ValueError, TypeError):
        return False, "Le nombre de recommandations doit être un entier valide"


def validate_rating_value(rating):
    """
    Valide une note
    
    Args:
        rating: Note à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if rating is None:
        return False, "La note est requise"
    
    try:
        rating = float(rating)
        if rating < 0.5 or rating > 5.0:
            return False, "La note doit être comprise entre 0.5 et 5.0"
        
        # Check if rating is in valid increments (0.5, 1.0, 1.5, etc.)
        if (rating * 2) % 1 != 0:
            return False, "La note doit être un multiple de 0.5"
        
        return True, None
    except (ValueError, TypeError):
        return False, "La note doit être un nombre valide"


def validate_rating_data(data):
    """
    Valide les données de notation complètes
    
    Args:
        data: Dictionnaire contenant les données de notation (userId, movieId, rating)
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if not isinstance(data, dict):
        return False, "Les données doivent être un objet JSON valide"
    
    # Vérifier la présence des champs requis
    required_fields = ['userId', 'movieId', 'rating']
    for field in required_fields:
        if field not in data:
            return False, f"Le champ '{field}' est requis"
    
    # Valider l'ID utilisateur
    valid, error_msg = validate_user_id(data['userId'])
    if not valid:
        return False, error_msg
    
    # Valider l'ID du film
    valid, error_msg = validate_movie_id(data['movieId'])
    if not valid:
        return False, error_msg
    
    # Valider la note
    valid, error_msg = validate_rating_value(data['rating'])
    if not valid:
        return False, error_msg
    
    return True, None


def validate_genre(genre):
    """
    Valide un genre de film
    
    Args:
        genre: Genre à valider
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if not genre or not isinstance(genre, str):
        return False, "Le genre doit être une chaîne de caractères non vide"
    
    if len(genre.strip()) < 2:
        return False, "Le genre doit contenir au moins 2 caractères"
    
    if len(genre.strip()) > 50:
        return False, "Le genre est trop long (max 50 caractères)"
    
    return True, None


def validate_pagination(limit, offset):
    """
    Valide les paramètres de pagination
    
    Args:
        limit: Nombre d'éléments par page
        offset: Décalage de début
        
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    try:
        limit = int(limit)
        offset = int(offset)
        
        if limit < 1:
            return False, "La limite doit être au moins 1"
        
        if limit > 1000:
            return False, "La limite maximum est 1000"
        
        if offset < 0:
            return False, "Le décalage doit être positif ou nul"
        
        return True, None
    except (ValueError, TypeError):
        return False, "Les paramètres de pagination doivent être des entiers valides"

