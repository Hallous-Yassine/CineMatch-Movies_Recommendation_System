import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovieById, getSimilarMovies, addRating, getMovieTags, addTag, getMoviePosterUrl } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import RatingStars from "@/components/RatingStars";
import TagInput from "@/components/TagInput";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, Film, Tags } from "lucide-react";
import { toast } from "sonner";

interface MovieDetailsProps {
  userId: number | null;
}

const MovieDetails = ({ userId }: MovieDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const queryClient = useQueryClient();

  const { data: movieData, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieById(movieId),
    enabled: movieId > 0,
  });

  const { data: similarMovies } = useQuery({
    queryKey: ["similar", movieId],
    queryFn: () => getSimilarMovies(movieId, 6),
    enabled: movieId > 0,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags", movieId],
    queryFn: () => getMovieTags(movieId),
    enabled: movieId > 0,
  });

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => addRating(userId!, movieId, rating),
    onSuccess: () => {
      toast.success("Rating submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });

  const tagMutation = useMutation({
    mutationFn: (tag: string) => addTag(userId!, movieId, tag),
    onSuccess: () => {
      toast.success("Tag added successfully!");
      queryClient.invalidateQueries({ queryKey: ["tags", movieId] });
    },
    onError: () => {
      toast.error("Failed to add tag");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const movie = movieData?.data;
  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-muted-foreground">Movie not found</p>
      </div>
    );
  }

  const genres = movie.genres.split("|");
  const year = movie.year || movie.title.match(/\((\d{4})\)/)?.[1] || "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
  const tags = tagsData?.data?.slice(0, 10) || [];
  const posterUrl = getMoviePosterUrl(movie);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl font-bold">{cleanTitle}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              {movie.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="font-medium text-gold">{movie.averageRating.toFixed(1)}</span>
                  <span className="text-sm">({movie.ratingCount} ratings)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Movie Poster */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="overflow-hidden">
              <img 
                src={posterUrl}
                alt={cleanTitle}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </Card>
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <Card className="p-6 space-y-6 bg-gradient-card">
              {/* Genres */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* User Rating */}
              {userId && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Rate This Movie</h3>
                    <RatingStars
                      rating={0}
                      size="lg"
                      interactive
                      onRate={(rating) => ratingMutation.mutate(rating)}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Add Tags */}
              {userId && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tags className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-medium text-muted-foreground">Add Your Tags</h3>
                    </div>
                    <TagInput
                      existingTags={tags.map((t) => t.tag)}
                      onAddTag={(tag) => tagMutation.mutate(tag)}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Similar Movies */}
        {similarMovies?.data && similarMovies.data.length > 0 && (
          <div className="space-y-4 container mx-auto px-4">
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Similar Movies</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {similarMovies.data.map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
