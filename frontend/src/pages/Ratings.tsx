import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Tag, Plus, X, Trash2, Film, Award } from "lucide-react";
import { toast } from "sonner";

interface Movie {
  movieId: number;
  title: string;
  genres?: string;
}

interface Rating {
  movieId: number;
  title: string;
  rating: number;
  timestamp: number;
  genres?: string;
}

interface TagItem {
  movieId: number;
  tag: string;
  title: string;
  timestamp: number;
}

const Ratings = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [movieSearch, setMovieSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [userTags, setUserTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:5000/api";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        loadUserRatings(user.id);
        loadUserTags(user.id);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const loadUserRatings = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/ratings/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserRatings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load ratings:", error);
    }
  };

  const loadUserTags = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/tags/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserTags(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const searchMovies = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search movies");
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (movieSearch) {
        searchMovies(movieSearch);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [movieSearch]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieSearch(movie.title);
    setSearchResults([]);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmitRating = async () => {
    if (!currentUser) {
      toast.error("Please login to rate movies");
      return;
    }

    if (!selectedMovie) {
      toast.error("Please select a movie");
      return;
    }

    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const ratingRes = await fetch(`${API_BASE}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          movieId: selectedMovie.movieId,
          rating: selectedRating,
        }),
      });

      const ratingData = await ratingRes.json();
      if (!ratingData.success) {
        throw new Error(ratingData.error || "Failed to submit rating");
      }

      if (tags.length > 0) {
        for (const tag of tags) {
          await fetch(`${API_BASE}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUser.id,
              movieId: selectedMovie.movieId,
              tag: tag,
            }),
          });
        }
      }

      toast.success("Rating submitted successfully!");
      
      setSelectedRating(0);
      setTags([]);
      setMovieSearch("");
      setSelectedMovie(null);
      
      loadUserRatings(currentUser.id);
      loadUserTags(currentUser.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (movieId: number) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/ratings/${currentUser.id}/${movieId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Rating deleted");
        loadUserRatings(currentUser.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete rating");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full card-glow bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-8 text-center">
            <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Login Required</h2>
            <p className="text-muted-foreground">
              Please login to rate movies and add tags
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-4xl font-bold gradient-text">Ratings & Tags</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Rate movies and add tags to improve your recommendations
          </p>
          <div className="flex items-center gap-2 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg w-fit">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              Logged in as <span className="font-semibold text-primary">{currentUser.username}</span>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="card-glow bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Add New Rating</CardTitle>
              <CardDescription className="text-muted-foreground">
                Rate a movie and add custom tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Search Movie</Label>
                <div className="relative">
                  <Input
                    placeholder="Search for a movie to rate..."
                    value={movieSearch}
                    onChange={(e) => setMovieSearch(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border/50 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((movie) => (
                        <button
                          key={movie.movieId}
                          onClick={() => handleSelectMovie(movie)}
                          className="w-full p-3 text-left hover:bg-accent/20 transition-colors border-b border-border/30 last:border-0"
                        >
                          <div className="font-medium text-foreground">{movie.title}</div>
                          {movie.genres && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {movie.genres.split("|").slice(0, 3).join(", ")}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedMovie && (
                  <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded text-sm text-foreground">
                    Selected: <span className="font-semibold">{selectedMovie.title}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Your Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setSelectedRating(rating)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          rating <= (hoveredRating || selectedRating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You selected: <span className="text-primary font-semibold">{selectedRating} stars</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Add Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    className="bg-background/50 border-border/50"
                  />
                  <Button onClick={handleAddTag} size="icon" variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag, idx) => (
                      <Badge key={idx} className="pl-3 pr-1 py-1 bg-accent/20 text-accent border-accent/30">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmitRating} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Rating"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Ratings</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {userRatings.length} movies rated
              </Badge>
            </div>
            
            {userRatings.length === 0 ? (
              <Card className="card-glow bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No ratings yet. Start rating movies!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {userRatings.map((item) => (
                  <Card key={item.movieId} className="card-glow bg-card/80 backdrop-blur-sm border-border/50 group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </CardTitle>
                          {item.genres && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.genres.split("|").slice(0, 3).map((genre, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-accent/30 text-accent">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className="flex items-center gap-1 text-primary">
                            <Star className="w-5 h-5 fill-primary" />
                            <span className="text-lg font-bold">{item.rating}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRating(item.movieId)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {userTags.filter(t => t.movieId === item.movieId).length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {userTags
                            .filter(t => t.movieId === item.movieId)
                            .map((tagItem, idx) => (
                              <Badge key={idx} className="text-xs bg-accent/20 text-accent border-accent/30">
                                <Tag className="w-3 h-3 mr-1" />
                                {tagItem.tag}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;