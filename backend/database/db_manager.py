import os
import sys
import time
import pandas as pd

# === Import des chemins depuis config.py ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MOVIES_FILE, RATINGS_FILE


class DatabaseManager:
    """
    Gestionnaire de base de données locale (CSV) pour le système de recommandation de films.
    Gère les fichiers :
      - movies.csv
      - ratings.csv
      - users.csv
      - tags.csv (optionnel)
      - links.csv (optionnel)
    """

    def __init__(self):
        self.movies_df = None
        self.ratings_df = None
        self.users_df = None
        self.tags_df = None
        self.links_df = None
        self.data_dir = os.path.dirname(MOVIES_FILE)
        self.load_data()

    # ======================================================
    # === Chargement des données ===
    # ======================================================

    def load_data(self):
        """Charge les différents fichiers CSV et initialise les DataFrames."""
        try:
            # === Films ===
            self.movies_df = self._load_csv(MOVIES_FILE, "films", required=True)
            # === Notes ===
            self.ratings_df = self._load_csv(RATINGS_FILE, "ratings", required=True)
            # === Utilisateurs ===
            self.users_df = self._load_csv(os.path.join(self.data_dir, "users.csv"), "utilisateurs", required=False)
            # === Tags (optionnels) ===
            self.tags_df = self._load_csv(os.path.join(self.data_dir, "tags.csv"), "tags", required=False)
            # === Liens (optionnels) ===
            self.links_df = self._load_csv(os.path.join(self.data_dir, "links.csv"), "liens", required=False)

        except Exception as e:
            print(f"❌ Erreur lors du chargement des données : {e}")
            raise

    def _load_csv(self, path, label, required=False):
        """Charge un fichier CSV s'il existe, sinon retourne None."""
        if os.path.exists(path):
            df = pd.read_csv(path, encoding="utf-8", on_bad_lines="warn")
            print(f"✓ {len(df)} {label} chargés depuis {os.path.basename(path)}")
            return df
        elif required:
            raise FileNotFoundError(f"Fichier requis introuvable : {path}")
        else:
            print(f"ℹ️  Fichier {os.path.basename(path)} non trouvé (optionnel)")
            return None

    # ======================================================
    # === Méthodes Films ===
    # ======================================================

    def get_all_movies(self):
        """Retourne tous les films sous forme de liste de dictionnaires."""
        return [] if self.movies_df is None else self.movies_df.to_dict("records")

    def get_movie_by_id(self, movie_id):
        """Retourne les informations d’un film selon son ID."""
        if self.movies_df is None:
            return None
        movie = self.movies_df[self.movies_df["movieId"] == movie_id]
        return movie.iloc[0].to_dict() if not movie.empty else None

    def search_movies(self, query):
        """Recherche les films contenant le texte donné dans leur titre."""
        if not query or self.movies_df is None:
            return []
        query = query.lower()
        results = self.movies_df[self.movies_df["title"].str.lower().str.contains(query, na=False)]
        return results.to_dict("records")

    def get_movies_by_genre(self, genre):
        """Retourne les films d’un genre spécifique."""
        if not genre or self.movies_df is None:
            return []
        results = self.movies_df[self.movies_df["genres"].str.contains(genre, case=False, na=False)]
        return results.to_dict("records")

    def get_all_genres(self):
        """Retourne la liste de tous les genres uniques."""
        if self.movies_df is None or "genres" not in self.movies_df.columns:
            return []
        all_genres = set()
        for g in self.movies_df["genres"].dropna():
            all_genres.update(g.split("|"))
        return sorted(all_genres)

    def get_popular_movies(self, n=10, min_ratings=10):
        """Retourne les films les mieux notés avec au moins `min_ratings` avis."""
        if self.movies_df is None or self.ratings_df is None:
            return []

        stats = (
            self.ratings_df.groupby("movieId")["rating"]
            .agg(["count", "mean"])
            .rename(columns={"count": "num_ratings", "mean": "avg_rating"})
            .reset_index()
        )

        top = stats[stats["num_ratings"] >= min_ratings].sort_values("avg_rating", ascending=False).head(n)
        return (
            top.merge(self.movies_df, on="movieId", how="left")[["movieId", "title", "genres", "avg_rating", "num_ratings"]]
            .to_dict("records")
        )

    # ======================================================
    # === Méthodes Ratings ===
    # ======================================================

    def add_rating(self, user_id, movie_id, rating):
        """Ajoute un rating (note) pour un utilisateur et un film."""
        if not (0 <= rating <= 5):
            print("❌ Rating invalide : doit être entre 0 et 5")
            return False
        if self.get_movie_by_id(movie_id) is None:
            print(f"❌ Film introuvable (ID: {movie_id})")
            return False

        new_entry = pd.DataFrame(
            {"userId": [user_id], "movieId": [movie_id], "rating": [rating], "timestamp": [int(time.time())]}
        )
        self.ratings_df = pd.concat([self.ratings_df, new_entry], ignore_index=True)

        try:
            self.ratings_df.to_csv(RATINGS_FILE, index=False)
            print(f"✓ Rating ajouté : user {user_id} → movie {movie_id} → {rating}★")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde du rating : {e}")
            return False

    def get_user_ratings(self, user_id):
        """Retourne toutes les notes d’un utilisateur avec les infos des films."""
        if self.ratings_df is None:
            return []
        data = self.ratings_df[self.ratings_df["userId"] == user_id]
        return data.merge(self.movies_df, on="movieId", how="left").to_dict("records")

    def get_movie_avg_rating(self, movie_id):
        """Retourne la moyenne des notes d’un film."""
        data = self.ratings_df[self.ratings_df["movieId"] == movie_id]
        return None if data.empty else data["rating"].mean()

    # ======================================================
    # === Méthodes Utilisateurs ===
    # ======================================================

    def get_user_by_id(self, user_id):
        """Retourne un utilisateur selon son ID."""
        if self.users_df is None:
            return None
        user = self.users_df[self.users_df["id"] == user_id]
        return user.iloc[0].to_dict() if not user.empty else None

    def get_user_by_username(self, username):
        """Retourne un utilisateur selon son username."""
        if self.users_df is None:
            return None
        user = self.users_df[self.users_df["username"] == username]
        return user.iloc[0].to_dict() if not user.empty else None

    def authenticate_user(self, username, password):
        """Vérifie les identifiants d’un utilisateur."""
        user = self.get_user_by_username(username)
        return user if user and user["password"] == password else None

    def add_user(self, username, firstname, lastname, password):
        """Crée un nouvel utilisateur."""
        if self.users_df is None:
            return False
        if not self.users_df[self.users_df["username"] == username].empty:
            print(f"❌ Username '{username}' déjà existant")
            return False

        new_id = int(self.users_df["id"].max()) + 1 if not self.users_df.empty else 1
        new_user = pd.DataFrame(
            {"id": [new_id], "username": [username], "firstname": [firstname], "lastname": [lastname], "password": [password]}
        )

        self.users_df = pd.concat([self.users_df, new_user], ignore_index=True)
        try:
            self.users_df.to_csv(os.path.join(self.data_dir, "users.csv"), index=False)
            print(f"✓ Utilisateur '{username}' créé avec succès (ID: {new_id})")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de l’enregistrement : {e}")
            return False

    def get_all_users(self):
        """Retourne tous les utilisateurs."""
        return [] if self.users_df is None else self.users_df.to_dict("records")

    # ======================================================
    # === Méthodes Tags (optionnelles) ===
    # ======================================================

    def add_tag(self, user_id, movie_id, tag):
        """Ajoute un tag à un film."""
        if self.get_movie_by_id(movie_id) is None:
            print(f"❌ Film introuvable (ID: {movie_id})")
            return False

        if self.tags_df is None:
            self.tags_df = pd.DataFrame(columns=["userId", "movieId", "tag", "timestamp"])

        new_tag = pd.DataFrame({"userId": [user_id], "movieId": [movie_id], "tag": [tag], "timestamp": [int(time.time())]})
        self.tags_df = pd.concat([self.tags_df, new_tag], ignore_index=True)

        try:
            self.tags_df.to_csv(os.path.join(self.data_dir, "tags.csv"), index=False)
            print(f"✓ Tag '{tag}' ajouté au film {movie_id}")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde du tag : {e}")
            return False

    def get_movie_tags(self, movie_id):
        """Retourne tous les tags d’un film."""
        if self.tags_df is None:
            return []
        return self.tags_df[self.tags_df["movieId"] == movie_id].to_dict("records")

    # ======================================================
    # === Méthodes Liens (optionnelles) ===
    # ======================================================

    def get_imdb_url(self, movie_id):
        """Retourne l’URL IMDb d’un film."""
        if self.links_df is None:
            return None
        row = self.links_df[self.links_df["movieId"] == movie_id]
        if row.empty or pd.isna(row.iloc[0]["imdbId"]):
            return None
        imdb_id = str(int(row.iloc[0]["imdbId"])).zfill(7)
        return f"https://www.imdb.com/title/tt{imdb_id}/"

    def get_tmdb_url(self, movie_id):
        """Retourne l’URL TMDb d’un film."""
        if self.links_df is None:
            return None
        row = self.links_df[self.links_df["movieId"] == movie_id]
        if row.empty or pd.isna(row.iloc[0]["tmdbId"]):
            return None
        return f"https://www.themoviedb.org/movie/{int(row.iloc[0]['tmdbId'])}"
