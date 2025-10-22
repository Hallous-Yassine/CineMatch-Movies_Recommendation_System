import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
import os
import sys

# Allow imports from parent folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import N_RECOMMENDATIONS, MIN_RATINGS


class MovieRecommender:
    """
    A hybrid movie recommender system supporting:
    - Content-based filtering
    - Item-based collaborative filtering
    - User-based collaborative filtering
    - Popularity-based ranking
    - Combined hybrid recommendation
    """

    def __init__(self, movies_df, ratings_df):
        self.movies_df = movies_df.copy()
        self.ratings_df = ratings_df.copy()
        self.user_item_matrix = None
        self.movie_similarity_df = None
        self.user_similarity_df = None
        self.prepare_data()

    # =======================================================
    # =============== DATA PREPARATION =======================
    # =======================================================
    def prepare_data(self):
        """Prepare data matrices for similarity calculations."""
        try:
            # Ensure genres are strings and non-null
            if "genres" in self.movies_df.columns:
                self.movies_df["genres"] = self.movies_df["genres"].fillna("").astype(str)

            # Create user-item matrix: rows = users, cols = movies
            self.user_item_matrix = (
                self.ratings_df.pivot_table(index="userId", columns="movieId", values="rating")
                .fillna(0)
            )

            print(f"✓ User-Item matrix: {self.user_item_matrix.shape}")

            # Precompute similarities
            self._calculate_movie_similarity()
            self._calculate_user_similarity()

        except Exception as e:
            print(f"❌ Error in prepare_data: {e}")
            raise

    def _calculate_movie_similarity(self):
        """Compute cosine similarity between movies (item-based CF)."""
        try:
            movie_matrix = self.user_item_matrix.T
            if movie_matrix.empty:
                print("⚠️ No movies found for similarity.")
                return

            movie_sparse = csr_matrix(movie_matrix.values)
            similarity = cosine_similarity(movie_sparse)

            self.movie_similarity_df = pd.DataFrame(
                similarity, index=movie_matrix.index, columns=movie_matrix.index
            )
            print("✓ Movie similarity matrix computed.")

        except Exception as e:
            print(f"❌ Error computing movie similarity: {e}")
            raise

    def _calculate_user_similarity(self):
        """Compute cosine similarity between users (user-based CF)."""
        try:
            if self.user_item_matrix.empty:
                print("⚠️ No users found for similarity.")
                return

            user_sparse = csr_matrix(self.user_item_matrix.values)
            similarity = cosine_similarity(user_sparse)

            self.user_similarity_df = pd.DataFrame(
                similarity, index=self.user_item_matrix.index, columns=self.user_item_matrix.index
            )
            print("✓ User similarity matrix computed.")

        except Exception as e:
            print(f"❌ Error computing user similarity: {e}")
            raise

    # =======================================================
    # ============= RECOMMENDATION METHODS ==================
    # =======================================================
    def get_content_based_recommendations(self, movie_id, n=N_RECOMMENDATIONS):
        """Recommend similar movies by genre (Jaccard similarity)."""
        try:
            movie = self.movies_df[self.movies_df["movieId"] == movie_id]
            if movie.empty:
                return []

            base_genres = set(str(movie.iloc[0]["genres"]).split("|"))

            def jaccard_similarity(genres):
                other = set(str(genres).split("|"))
                return len(base_genres & other) / len(base_genres | other) if other else 0

            recs = self.movies_df.copy()
            recs["similarity"] = recs["genres"].apply(jaccard_similarity)
            recs = recs[recs["movieId"] != movie_id]
            recs = recs[recs["similarity"] > 0]

            if recs.empty:
                return []

            # Add ratings info
            stats = (
                self.ratings_df.groupby("movieId")["rating"]
                .agg(["mean", "count"])
                .rename(columns={"mean": "avg_rating", "count": "rating_count"})
                .reset_index()
            )

            recs = recs.merge(stats, on="movieId", how="left")
            recs = recs[recs["rating_count"].fillna(0) >= MIN_RATINGS]

            recs = recs.sort_values(["similarity", "avg_rating"], ascending=[False, False]).head(n)
            recs["avg_rating"] = recs["avg_rating"].round(2)
            recs["similarity"] = recs["similarity"].round(3)

            return recs[["movieId", "title", "genres", "avg_rating", "rating_count", "similarity"]].to_dict("records")

        except Exception as e:
            print(f"❌ Error in content-based recommendations: {e}")
            return []

    def get_item_based_recommendations(self, movie_id, n=N_RECOMMENDATIONS):
        """Recommend similar movies using user rating patterns."""
        try:
            if self.movie_similarity_df is None or movie_id not in self.movie_similarity_df.index:
                return []

            similar_movies = (
                self.movie_similarity_df[movie_id]
                .drop(movie_id)
                .sort_values(ascending=False)
                .head(n * 2)
            )

            recs = []
            for mid, score in similar_movies.items():
                movie = self.movies_df[self.movies_df["movieId"] == mid]
                if movie.empty:
                    continue

                ratings = self.ratings_df[self.ratings_df["movieId"] == mid]
                if len(ratings) < MIN_RATINGS:
                    continue

                recs.append({
                    "movieId": mid,
                    "title": movie.iloc[0]["title"],
                    "genres": movie.iloc[0]["genres"],
                    "similarity_score": round(float(score), 3),
                    "avg_rating": round(ratings["rating"].mean(), 2),
                    "rating_count": len(ratings)
                })

            return sorted(recs, key=lambda x: x["similarity_score"], reverse=True)[:n]

        except Exception as e:
            print(f"❌ Error in item-based recommendations: {e}")
            return []

    def get_collaborative_recommendations(self, user_id, n=N_RECOMMENDATIONS):
        """Recommend movies based on similar users' preferences."""
        try:
            if self.user_similarity_df is None or user_id not in self.user_item_matrix.index:
                return self.get_popular_recommendations(n)

            user_ratings = self.user_item_matrix.loc[user_id]
            unrated = user_ratings[user_ratings == 0].index
            similar_users = (
                self.user_similarity_df[user_id]
                .drop(user_id)
                .sort_values(ascending=False)
                .head(50)
            )

            predictions = []
            for mid in unrated:
                sim_ratings = self.user_item_matrix.loc[similar_users.index, mid]
                mask = sim_ratings > 0
                if mask.sum() == 0:
                    continue

                weights = similar_users[mask]
                ratings = sim_ratings[mask]
                predicted = np.dot(weights, ratings) / weights.sum()
                predictions.append((mid, predicted))

            if not predictions:
                return self.get_popular_recommendations(n)

            top_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:n]
            recs = []

            for mid, pred in top_preds:
                movie = self.movies_df[self.movies_df["movieId"] == mid]
                if movie.empty:
                    continue

                movie_ratings = self.ratings_df[self.ratings_df["movieId"] == mid]
                recs.append({
                    "movieId": mid,
                    "title": movie.iloc[0]["title"],
                    "genres": movie.iloc[0]["genres"],
                    "predicted_rating": round(float(pred), 2),
                    "avg_rating": round(movie_ratings["rating"].mean(), 2) if not movie_ratings.empty else None,
                    "rating_count": len(movie_ratings)
                })

            return recs

        except Exception as e:
            print(f"❌ Error in collaborative recommendations: {e}")
            return self.get_popular_recommendations(n)

    def get_popular_recommendations(self, n=N_RECOMMENDATIONS):
        """Recommend globally popular movies."""
        try:
            stats = (
                self.ratings_df.groupby("movieId")["rating"]
                .agg(["count", "mean"])
                .rename(columns={"count": "rating_count", "mean": "avg_rating"})
                .reset_index()
            )

            stats = stats[stats["rating_count"] >= MIN_RATINGS]
            if stats.empty:
                return []

            # Weighted rating (Bayesian)
            C = stats["avg_rating"].mean()
            m = stats["rating_count"].quantile(0.7)
            stats["weighted_rating"] = (
                (stats["rating_count"] / (stats["rating_count"] + m)) * stats["avg_rating"]
                + (m / (stats["rating_count"] + m)) * C
            )

            top = stats.sort_values("weighted_rating", ascending=False).head(n)
            recs = top.merge(self.movies_df, on="movieId", how="left")

            recs["avg_rating"] = recs["avg_rating"].round(2)
            recs["weighted_rating"] = recs["weighted_rating"].round(2)

            formatted = []
            for _, row in recs.iterrows():
                # Separate title and year (e.g., "Toy Story (1995)")
                title = row["title"]
                year = None
                if "(" in title and ")" in title:
                    try:
                        year = title.split("(")[-1].replace(")", "").strip()
                        title = title[: title.rfind("(")].strip()
                    except Exception:
                        pass

                # Split genres into a list
                genres = row["genres"].split("|") if isinstance(row["genres"], str) else []

                formatted.append({
                    "movieId": int(row["movieId"]),
                    "title": title,
                    "year": year,
                    "genres": genres,
                    "avg_rating": float(row["avg_rating"]),
                    "rating_count": int(row["rating_count"]),
                    "weighted_rating": float(row["weighted_rating"])
                })

            return formatted

        except Exception as e:
            print(f"❌ Error in popular recommendations: {e}")
            return []


    # =======================================================
    # =============== USER PROFILE ANALYSIS =================
    # =======================================================
    def get_user_profile(self, user_id):
        """Analyze a user's preferences (favorite genres, ratings)."""
        try:
            if user_id not in self.user_item_matrix.index:
                return None

            user_ratings = self.ratings_df[self.ratings_df["userId"] == user_id]
            if user_ratings.empty:
                return None

            user_movies = user_ratings.merge(self.movies_df, on="movieId", how="left")

            # Genre preferences
            genre_data = []
            for _, row in user_movies.iterrows():
                for genre in str(row["genres"]).split("|"):
                    genre_data.append({"genre": genre, "rating": row["rating"]})

            genre_df = pd.DataFrame(genre_data)
            genre_stats = (
                genre_df.groupby("genre")["rating"]
                .agg(["mean", "count"])
                .rename(columns={"mean": "avg_rating"})
                .reset_index()
                .sort_values("avg_rating", ascending=False)
            )

            return {
                "user_id": user_id,
                "total_ratings": len(user_ratings),
                "avg_rating": round(user_ratings["rating"].mean(), 2),
                "favorite_genres": genre_stats.head(5).to_dict("records"),
                "rating_distribution": user_ratings["rating"].value_counts().sort_index().to_dict()
            }

        except Exception as e:
            print(f"❌ Error generating user profile: {e}")
            return None
