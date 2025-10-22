import { useQuery } from "@tanstack/react-query";
import { getHybridRecommendations, getCollaborativeRecommendations, getContentBasedRecommendations, Movie } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Users, Film, TrendingUp } from "lucide-react";
import { Navigate } from "react-router-dom";

interface RecommendationsProps {
  userId: number | null;
}

const Recommendations = ({ userId }: RecommendationsProps) => {
  if (!userId) {
    return <Navigate to="/auth" />;
  }

  const { data: hybridRecs, isLoading: loadingHybrid } = useQuery({
    queryKey: ["hybrid-recommendations", userId],
    queryFn: () => getHybridRecommendations(userId, 24),
  });

  const { data: collaborativeRecs, isLoading: loadingCollab } = useQuery({
    queryKey: ["collaborative-recommendations", userId],
    queryFn: () => getCollaborativeRecommendations(userId, 24),
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Your Recommendations
        </h1>
        <p className="text-muted-foreground">
          Personalized movie suggestions based on your taste and viewing history
        </p>
      </div>

      <Tabs defaultValue="hybrid" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hybrid" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Hybrid AI
          </TabsTrigger>
          <TabsTrigger value="collaborative" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Similar Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hybrid" className="space-y-4">
          <Card className="p-4 bg-gradient-card">
            <p className="text-sm text-muted-foreground">
              <strong>Hybrid recommendations</strong> combine multiple AI algorithms: content-based filtering (genre similarity), 
              collaborative filtering (user preferences), and popularity metrics to give you the best suggestions.
            </p>
          </Card>

          {loadingHybrid ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : hybridRecs?.data && hybridRecs.data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {hybridRecs.data.map((movie: Movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No recommendations yet. Rate some movies to get personalized suggestions!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collaborative" className="space-y-4">
          <Card className="p-4 bg-gradient-card">
            <p className="text-sm text-muted-foreground">
              <strong>Collaborative filtering</strong> finds users with similar taste to yours and recommends movies 
              they enjoyed that you haven't seen yet. The more you rate, the better it gets!
            </p>
          </Card>

          {loadingCollab ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : collaborativeRecs?.data && collaborativeRecs.data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {collaborativeRecs.data.map((movie: Movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Not enough data yet. Rate more movies to find users with similar taste!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recommendations;
