# 🎬 CineMatch - Movies Recommendation System

CineMatch is a smart movie recommendation platform.  
It suggests films you’ll love based on your ratings and viewing preferences.  
The project combines a **Python backend** with a **TypeScript + React frontend** for a smooth, modern user experience.

## 🚀 Demo

🎥 [Watch Demo Video](https://github.com/Hallous-Yassine/CineMatch-Movies_Recommendation_System/blob/main/Enregistrement%20de%20l'écran%202025-10-22%20222048.mp4)  

## ⚙️ Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 💡 Usage

1. Register or log in.  
2. Rate a few movies.  
3. Get personalized movie recommendations.  
4. Browse, search, and explore movie details.


## 🌟 Features

- User authentication  
- Interactive movie rating system  
- Personalized movie recommendations  
- Real-time suggestions  
- Responsive and modern UI  

### 🧠 Recommendation Algorithms

- **Content-Based Filtering** – Recommends similar movies using metadata (genre, cast, etc.)  
- **Collaborative Filtering** – Suggests movies based on similar users’ preferences  
- **Hybrid Model** – Combines both for more accurate results  

## 🏗️ Project Architecture

### Backend Structure
```bash
backend/
│
├── config.py                      # Configuration constants and settings
├── server.py                      # Flask application entry point
│
├── api/                           # REST API endpoints
│   ├── __init__.py
│   ├── routes.py                  # Central route registration
│   ├── movies.py                  # Movie CRUD operations
│   ├── ratings.py                 # Rating and tag management
│   ├── recommendations.py         # Recommendation engine endpoints
│   └── users.py                   # User authentication and profiles
│
├── data/                          # MovieLens dataset (CSV files)
│   ├── movies.csv                 # 9,742 movies with genres
│   ├── ratings.csv                # 100,836 user ratings
│   ├── tags.csv                   # User-generated tags
│   ├── links.csv                  # IMDB/TMDB external IDs
│   └── users.csv                  # User accounts and credentials
│
├── database/
│   └── db_manager.py             # Database operations and queries
│
├── model/
│   └── recommender.py            # ML recommendation algorithms
│
└── utils/
    └── validators.py             # Input validation utilities
```

### Frontend Structure

```bash
frontend/src/
│
├── main.tsx                       # Application entry point
├── App.tsx                        # Main app with routing
├── index.css                      # Global styles and design system
│
├── assets/                        # Images and static files
│   ├── hero-bg.jpg
│   └── hero-cinema.jpg
│
├── components/
│   ├── Layout.tsx                 # App layout with sidebar
│   └── ui/                        # Shadcn UI component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── label.tsx
│       ├── sidebar.tsx
│       └── ... (40+ reusable components)
│
├── hooks/                         # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/
│   └── utils.ts                   # Utility functions
│
└── pages/                         # Main application pages
    ├── Auth.tsx                   # Login/Signup page
    ├── Home.tsx                   # Dashboard with trending movies
    ├── Index.tsx                  # Landing page
    ├── Recommendations.tsx        # Recommendation interface
    ├── Ratings.tsx                # Rating and tagging interface
    └── NotFound.tsx               # 404 error page
```

## 🧰 Tech Stack / Built With

- **TypeScript** – 65.6%  
- **Python** – 32.4%  
- **CSS** – 1.3%

## 📝 Remark

CineMatch provides accurate and user-friendly movie recommendations.  
Perfect for discovering new films tailored to your taste. 

## 📜 License

This project is open-source.  
Check it out on GitHub:  
👉 [CineMatch Repository](https://github.com/Hallous-Yassine/CineMatch-Movies_Recommendation_System)
















