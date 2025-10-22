import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2, Film, Star, TrendingUp, Users, Sparkles, Grid3x3, Award } from "lucide-react";

interface Movie {
  movieId: number;
  title: string;
  genres?: string[] | string;
  avg_rating?: number;
  rating_count?: number;
  weighted_rating?: number;
  similarity?: number;
  similarity_score?: number;
  predicted_rating?: number;
  year?: string;
}

export default function RecommendationPage() {
  const [method, setMethod] = useState<string>("popular");
  const [movieId, setMovieId] = useState<string>("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let url = "";

      switch (method) {
        case "content":
          if (!movieId) throw new Error("Movie ID is required for content-based recommendations");
          url = `${API_BASE}/recommendations/content/${movieId}`;
          break;

        case "item":
          if (!movieId) throw new Error("Movie ID is required for item-based recommendations");
          url = `${API_BASE}/recommendations/item/${movieId}`;
          break;

        case "collaborative":
          if (!currentUser?.id) throw new Error("Please login to get personalized recommendations");
          url = `${API_BASE}/recommendations/collaborative/${currentUser.id}`;
          break;

        case "hybrid":
          if (!currentUser?.id) throw new Error("Please login to get hybrid recommendations");
          url = `${API_BASE}/recommendations/hybrid/${currentUser.id}`;
          if (movieId) url += `?movie_id=${movieId}`;
          break;

        case "popular":
          url = `${API_BASE}/recommendations/popular`;
          break;

        default:
          throw new Error("Unknown recommendation method");
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to fetch recommendations");
      }

      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (methodName: string) => {
    switch (methodName) {
      case "popular": return <TrendingUp className="w-4 h-4" />;
      case "content": return <Film className="w-4 h-4" />;
      case "item": return <Grid3x3 className="w-4 h-4" />;
      case "collaborative": return <Users className="w-4 h-4" />;
      case "hybrid": return <Sparkles className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const getMethodDescription = (methodName: string) => {
    switch (methodName) {
      case "popular": return "Top-rated movies globally based on weighted ratings";
      case "content": return "Similar movies based on genres and features";
      case "item": return "Movies liked by users with similar rating patterns";
      case "collaborative": return "Personalized recommendations based on your ratings";
      case "hybrid": return "Combined approach using multiple methods for best results";
      default: return "";
    }
  };

  const requiresAuth = (methodName: string) => {
    return ["collaborative", "hybrid"].includes(methodName);
  };

  const requiresMovieId = (methodName: string) => {
    return ["content", "item"].includes(methodName);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Film className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Movie Recommendations
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover your next favorite movie using AI-powered recommendations
          </p>
        </div>

        {/* Controls Card */}
        <Card className="mb-10 card-glow border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-semibold mb-3 block text-foreground">
                  Recommendation Method
                </label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full bg-background/50 border-border/50">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>Popularity-Based</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="content">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-accent" />
                        <span>Content-Based</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="item">
                      <div className="flex items-center gap-2">
                        <Grid3x3 className="w-4 h-4 text-accent" />
                        <span>Item-Based Collaborative</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="collaborative">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>User-Based Collaborative</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hybrid">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Hybrid (Combined)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {getMethodDescription(method)}
                </p>
                {requiresAuth(method) && !currentUser && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                    <span>⚠️</span> This method requires login
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block text-foreground">
                  Movie ID
                  {requiresMovieId(method) && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                  {method === "hybrid" && (
                    <span className="text-muted-foreground ml-1">(optional)</span>
                  )}
                </label>
                <Input
                  placeholder={requiresMovieId(method) ? "Required - Enter movie ID" : "Optional - Enter movie ID"}
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  className="w-full bg-background/50 border-border/50"
                  type="number"
                />
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {requiresMovieId(method) 
                    ? "Required: Enter a movie ID to find similar movies"
                    : method === "hybrid"
                    ? "Optional: Add movie ID to boost content-based recommendations"
                    : "Not used for this method"}
                </p>
              </div>
            </div>

            {requiresAuth(method) && currentUser && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Logged in as <span className="font-semibold text-primary">{currentUser.username}</span> 
                  <span className="text-muted-foreground">(ID: {currentUser.id})</span>
                </p>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Button 
                onClick={fetchRecommendations} 
                disabled={loading || (requiresAuth(method) && !currentUser)}
                size="lg"
                className="min-w-[240px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Loading...
                  </>
                ) : (
                  <>
                    {getMethodIcon(method)}
                    <span className="ml-2">Get Recommendations</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-center text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recommended Movies</h2>
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                {results.length} results
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((movie, idx) => (
                <Card 
                  key={`${movie.movieId}-${idx}`} 
                  className="card-glow bg-card/90 backdrop-blur-sm border-border/50 group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                        {movie.year && (
                          <p className="text-muted-foreground text-sm mt-1">({movie.year})</p>
                        )}
                      </div>
                      <Film className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    </div>

                    {movie.genres && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(movie.genres) ? movie.genres : movie.genres.split("|")).slice(0, 3).map((genre, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-accent/20 text-accent text-xs rounded font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 border-t border-border/50 pt-4">
                      {movie.avg_rating !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Rating</span>
                          <span className="font-bold flex items-center gap-1 text-primary">
                            <Star className="w-4 h-4 fill-primary" />
                            {formatNumber(movie.avg_rating)}
                          </span>
                        </div>
                      )}
                      {movie.weighted_rating !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Weighted Score</span>
                          <span className="font-bold text-primary">{formatNumber(movie.weighted_rating)}</span>
                        </div>
                      )}
                      {movie.similarity !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Similarity</span>
                          <span className="font-bold text-accent">{formatNumber(movie.similarity)}</span>
                        </div>
                      )}
                      {movie.similarity_score !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Similarity Score</span>
                          <span className="font-bold text-accent">{formatNumber(movie.similarity_score)}</span>
                        </div>
                      )}
                      {movie.predicted_rating !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Predicted Rating</span>
                          <span className="font-bold text-accent">{formatNumber(movie.predicted_rating)}</span>
                        </div>
                      )}
                      {movie.rating_count !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Ratings</span>
                          <span className="font-medium text-foreground">{movie.rating_count.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
                <Film className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No recommendations yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a recommendation method and click "Get Recommendations" to discover movies tailored to your taste
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}