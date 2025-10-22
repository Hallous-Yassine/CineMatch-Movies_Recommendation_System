import { useQuery } from "@tanstack/react-query";
import { getPopularMovies, getHybridRecommendations } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-cinema.jpg";

interface HomeProps {
  userId: number | null;
}

const Home = ({ userId }: HomeProps) => {
  const { data: popularMovies, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular-movies"],
    queryFn: () => getPopularMovies(12, 50),
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ["recommendations", userId],
    queryFn: () => (userId ? getHybridRecommendations(userId, 12) : Promise.resolve(null)),
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 text-center space-y-6 px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold">
            Discover Your Next
            <span className="block bg-gradient-gold bg-clip-text text-transparent">
              Favorite Film
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Personalized movie recommendations powered by advanced algorithms and your unique taste
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/browse">
              <Button variant="hero" size="lg">
                Explore Movies <ArrowRight className="ml-2" />
              </Button>
            </Link>
            {!userId && (
              <Link to="/auth">
                <Button variant="cinema" size="lg">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Personalized Recommendations */}
        {userId && recommendations?.data && (
          <section className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {recommendations.data.map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies */}
        <section className="space-y-6 animate-slide-up">
          <h2 className="text-3xl font-bold">Popular Movies</h2>
          {loadingPopular ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {popularMovies?.data?.map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
