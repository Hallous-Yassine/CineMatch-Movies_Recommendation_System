# 🎬 Système de Recommandation de Films

Un système intelligent de recommandation de films utilisant le **filtrage collaboratif** et le **filtrage basé sur le contenu**, avec une interface web moderne.

## 📋 Fonctionnalités

- 🔍 **Recherche de films** par titre
- 🎭 **Filtrage par genre**
- ⭐ **Films populaires** basés sur les notes des utilisateurs
- 🎯 **Recommandations personnalisées** :
  - Filtrage collaboratif (user-based)
  - Filtrage basé sur le contenu (genres)
  - Système hybride
  - Films similaires (item-based)
- ⭐ **Système de notation** pour améliorer les recommandations
- 📊 **Statistiques** sur chaque film

## 🛠️ Technologies Utilisées

### Backend
- **Python 3.8+**
- **Flask** - Framework web
- **Pandas** - Manipulation de données
- **Scikit-learn** - Algorithmes de ML
- **NumPy** - Calculs numériques
- **SciPy** - Calcul de similarité

### Frontend
- **HTML5 / CSS3**
- **JavaScript (Vanilla)**
- **API REST**

## 📁 Architecture du Projet

```
movie-recommender/
│
├── backend/
│   ├── api.py              # API Flask
│   ├── config.py           # Configuration
│   │
│   ├── data/               # Données
│   │   ├── movies.csv
│   │   └── ratings.csv
│   │
│   ├── database/           # Gestion des données
│   │   └── db_manager.py
│   │
│   └── model/              # Algorithmes de recommandation
│       └── recommender.py
│
├── frontend/
│   ├── index.html          # Interface utilisateur
│   ├── script.js           # Logique frontend
│   └── style.css           # Styles
│
├── requirements.txt        # Dépendances Python
└── README.md              # Documentation
```

## 🚀 Installation et Lancement

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd movie-recommender
```

### 2. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 3. Télécharger le dataset MovieLens (Optionnel)

Si vous voulez utiliser le vrai dataset MovieLens :

1. Téléchargez le dataset depuis [MovieLens](https://grouplens.org/datasets/movielens/)
2. Extrayez les fichiers `movies.csv` et `ratings.csv`
3. Placez-les dans le dossier `backend/data/`

**Note :** Le système créera automatiquement des données d'exemple si les fichiers ne sont pas trouvés.

### 4. Lancer le serveur backend

```bash
cd backend
python api.py
```

Le serveur démarrera sur `http://localhost:5000`

### 5. Ouvrir le frontend

Ouvrez simplement le fichier `frontend/index.html` dans votre navigateur :

```bash
cd frontend
# Ouvrez index.html dans votre navigateur
# Ou utilisez un serveur local (recommandé)
python -m http.server 8000
```

Puis accédez à `http://localhost:8000`

## 📚 Utilisation

### 1. Rechercher des films

- Tapez le titre d'un film dans la barre de recherche
- Ou filtrez par genre dans le menu déroulant

### 2. Voir les films populaires

- Cliquez sur l'onglet "⭐ Populaires"
- Les films les mieux notés s'affichent

### 3. Obtenir des recommandations

- Cliquez sur l'onglet "🎯 Recommandations"
- Entrez votre ID utilisateur (par défaut : 1)
- Choisissez le type de recommandation :
  - **Collaborative** : basée sur les utilisateurs similaires
  - **Hybride** : meilleur résultat combinant plusieurs méthodes
- Cliquez sur "Obtenir des recommandations"

### 4. Noter un film

- Cliquez sur l'onglet "⭐ Noter un film"
- Entrez votre ID utilisateur
- Entrez l'ID du film (visible dans les détails)
- Choisissez une note de 0.5 à 5.0
- Cliquez sur "Soumettre la note"

### 5. Voir les détails d'un film

- Cliquez sur n'importe quelle carte de film
- Une fenêtre modale s'ouvrira avec les détails
- Vous pouvez voir des films similaires depuis cette fenêtre

## 🔍 API Endpoints

### Films

```
GET  /api/movies                    # Liste tous les films
GET  /api/movies/<id>               # Détails d'un film
GET  /api/movies/search?q=<query>   # Rechercher des films
GET  /api/movies/genre/<genre>      # Films par genre
GET  /api/popular?n=<nombre>        # Films populaires
GET  /api/genres                    # Liste des genres
```

### Recommandations

```
GET  /api/recommend/collaborative/<user_id>?n=<nombre>
GET  /api/recommend/similar/<movie_id>?n=<nombre>
GET  /api/recommend/content/<movie_id>?n=<nombre>
GET  /api/recommend/hybrid/<user_id>?n=<nombre>&movie_id=<id>
```

### Notation

```
POST /api/rating
Body: {
  "userId": 1,
  "movieId": 1,
  "rating": 4.5
}
```

## 🧠 Algorithmes de Recommandation

### 1. Filtrage Collaboratif (User-Based)

- Trouve des utilisateurs avec des goûts similaires
- Recommande les films qu'ils ont aimés
- Utilise la similarité cosinus

### 2. Filtrage Collaboratif (Item-Based)

- Trouve des films similaires basés sur les patterns de notation
- Recommande des films similaires à ceux que vous avez aimés

### 3. Filtrage par Contenu

- Compare les genres des films
- Recommande des films avec des genres similaires

### 4. Système Hybride

- Combine plusieurs méthodes
- Donne les meilleurs résultats
- Pondère les différents scores

## 🎓 Ce que vous apprenez

- ✅ Manipulation de données avec **Pandas**
- ✅ Algorithmes de **Machine Learning** (Scikit-learn)
- ✅ **Filtrage collaboratif** et **basé sur le contenu**
- ✅ Calcul de **similarité cosinus**
- ✅ Création d'une **API REST** avec Flask
- ✅ Développement **Frontend/Backend**
- ✅ Gestion de **matrices creuses** (sparse matrices)
- ✅ Architecture **MVC** (Model-View-Controller)

## 💡 Améliorations Possibles

- [ ] Ajouter des affiches de films via l'API TMDB
- [ ] Implémenter la factorisation matricielle (SVD)
- [ ] Ajouter un système d'authentification utilisateur
- [ ] Créer des profils utilisateurs personnalisés
- [ ] Ajouter des filtres avancés (année, acteurs, etc.)
- [ ] Implémenter un système de cache
- [ ] Ajouter des tests unitaires
- [ ] Déployer sur Heroku ou AWS

## 📝 Bonus CV

✅ **Points forts à mentionner :**

- Développement d'un système de recommandation complet
- Implémentation de multiples algorithmes de ML
- Architecture backend/frontend découplée
- API REST documentée
- Manipulation de grandes quantités de données
- Interface utilisateur moderne et responsive

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifiez que toutes les dépendances sont installées
pip install -r requirements.txt

# Vérifiez que le port 5000 n'est pas déjà utilisé
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac
```

### Erreur CORS

Si vous avez des erreurs CORS, assurez-vous que :
- Le backend tourne sur `http://localhost:5000`
- `flask-cors` est installé

### Données vides

Si aucun film n'apparaît :
- Vérifiez que les fichiers CSV sont dans `backend/data/`
- Le système créera automatiquement des données d'exemple au premier lancement

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue !

## 📄 Licence

MIT License - Libre d'utilisation pour vos projets personnels et professionnels.

---

**Bon coding ! 🚀**