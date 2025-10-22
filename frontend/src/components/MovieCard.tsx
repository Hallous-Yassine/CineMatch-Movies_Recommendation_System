import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Movie, getMoviePosterUrl } from "@/lib/api";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const genres = movie.genres.split("|").slice(0, 2);
  const year = movie.year || movie.title.match(/\((\d{4})\)/)?.[1] || "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
  const posterUrl = getMoviePosterUrl(movie);

  return (
    <Link to={`/movie/${movie.movieId}`}>
      <Card className="group relative overflow-hidden border-border bg-gradient-card hover:border-primary/50 hover:shadow-elevated transition-all duration-300 h-full">
        {/* Movie Poster */}
        <div className="aspect-[2/3] bg-gradient-to-br from-cinema-dark to-muted relative overflow-hidden">
          <img 
            src={posterUrl}
            alt={cleanTitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-cinema-dark to-muted">
            <div className="text-center p-4">
              <p className="font-bold text-lg line-clamp-3 mb-2">{cleanTitle}</p>
              {year && <p className="text-sm text-muted-foreground">{year}</p>}
            </div>
          </div>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker/90 via-cinema-darker/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Movie Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {cleanTitle}
          </h3>
          
          {/* Rating */}
          {movie.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="font-medium text-gold">
                {movie.averageRating.toFixed(1)}
              </span>
              {movie.ratingCount && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({movie.ratingCount})
                </span>
              )}
            </div>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
