import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Tags, TrendingUp, Users, Play } from "lucide-react";
import heroCinema from "@/assets/hero-cinema.jpg";

// Type for movie fetched from backend
interface Movie {
  movieId: number;
  title: string;
  year?: string;
  genres: string[];
  avg_rating: number;
  rating_count: number;
  image?: string;
}

// --- Helper: map genre → poster ---
const getMovieImage = (genres: string[]) => {
  const genre = genres[0]?.toLowerCase() || "";

  const genreImages: Record<string, string> = {
    action: "https://images.unsplash.com/photo-1607287214260-c78e5ebcafee?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    adventure: "https://images.unsplash.com/photo-1709841367504-63d9b2dd9ad0?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    animation: "https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    children: "https://plus.unsplash.com/premium_photo-1663100002409-cde7aa799f2e?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    comedy: "https://images.unsplash.com/photo-1683117855296-979f17e62e87?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    crime: "https://images.unsplash.com/photo-1625449281218-cbb6183f0aec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    documentary: "https://images.unsplash.com/photo-1613399421098-f943ea81f1c4?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    drama: "https://images.unsplash.com/photo-1607287214260-c78e5ebcafee?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    fantasy: "https://images.unsplash.com/photo-1514539079130-25950c84af65?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    "film-noir": "https://images.unsplash.com/photo-1462715412043-8d09205be605?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    horror: "https://images.unsplash.com/photo-1503925802536-c9451dcd87b5?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    imax: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    musical: "https://images.unsplash.com/photo-1533106958148-daaeab8b83fe?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    mystery: "https://images.unsplash.com/photo-1633266841047-719b5f737149?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    romance: "https://images.unsplash.com/photo-1505343489387-c8d7f57b7c41?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    "sci-fi": "https://plus.unsplash.com/premium_photo-1682124758854-e6d372888b85?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    thriller: "https://images.unsplash.com/photo-1674521659179-b93d7eed75c8?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    war: "https://images.unsplash.com/photo-1494972688394-4cc796f9e4c5?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
    western: "https://images.unsplash.com/photo-1687973692549-cdabe636547f?ixlib=rb-4.0.3&w=300&h=450&fit=crop",
  };

  return genreImages[genre] ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop";
};

const Home = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const stats = [
    { label: "Active Users", value: "10K+", icon: Users, color: "text-primary" },
    { label: "Recommendations", value: "50K+", icon: Sparkles, color: "text-accent" },
    { label: "Ratings", value: "25K+", icon: Star, color: "text-yellow-500" },
    { label: "Categories", value: "100+", icon: Tags, color: "text-green-500" },
  ];

  // --- Fetch popular movies dynamically ---
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:5000/api/recommendations/popular?n=6");
        const data = await res.json();

        if (data.success) {
          const moviesWithImages = data.data.map((movie: any) => {
            const { title, genres } = movie;

            // Split "Toy Story (1995)" → { movieTitle, year }
            const match = title.match(/^(.*)\s\((\d{4})\)$/);
            const movieTitle = match ? match[1] : title;
            const year = match ? match[2] : "";

            // Ensure genres is an array
            const genresArray = Array.isArray(genres)
              ? genres
              : typeof genres === "string"
              ? genres.split("|")
              : [];

            return {
              ...movie,
              title: movieTitle,
              year,
              genres: genresArray,
              image: getMovieImage(genresArray),
            };
          });

          setPopularMovies(moviesWithImages);
        } else {
          setError(data.error || "Failed to fetch popular movies.");
        }
      } catch (err) {
        setError("Error connecting to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0">
          <img
            src={heroCinema}
            alt="Cinema theater"
            className="w-full h-full object-cover opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">AI-Powered Movie Recommendations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold">
            Discover Your Next <span className="gradient-text">Favorite Movie</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized movie recommendations powered by advanced AI. Rate films, explore genres, and find exactly what you're looking for.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="gold">
              <Link to="/recommendations">
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore Movies
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/ratings">
                <Star className="w-5 h-5 mr-2" />
                Rate & Tag
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Movies Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">
                Popular <span className="gradient-text">Movies</span>
              </h2>
              <p className="text-muted-foreground">Trending films everyone is watching</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/recommendations">View All</Link>
            </Button>
          </div>

          {loading && <p className="text-center text-muted-foreground">Loading popular movies...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularMovies.map((movie) => (
                <Card
                  key={movie.movieId}
                  className="card-glow bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group cursor-pointer transition-transform hover:scale-105"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gold" />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-xs font-semibold">
                        {movie.avg_rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 truncate">{movie.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{movie.genres[0] || "Unknown"}</span>
                      <span>{movie.year}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      
      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="pt-6 text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Our <span className="gradient-text">System</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Advanced features to enhance your experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <Sparkles className="w-10 h-10 text-gold mb-3" />
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  AI-powered algorithm learns your movie preferences to suggest films you'll love
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <Star className="w-10 h-10 text-gold mb-3" />
                <CardTitle>Rating System</CardTitle>
                <CardDescription>
                  Rate movies to help improve recommendations and contribute to the community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <Tags className="w-10 h-10 text-gold mb-3" />
                <CardTitle>Tag Organization</CardTitle>
                <CardDescription>
                  Organize and filter movies with custom tags for better discovery
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
