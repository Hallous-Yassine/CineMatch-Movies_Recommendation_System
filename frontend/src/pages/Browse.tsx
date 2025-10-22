import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMovies, searchMovies, getMoviesByGenre, getGenres } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Browse = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies", page, searchQuery, selectedGenre],
    queryFn: () => {
      if (searchQuery) {
        return searchMovies(searchQuery, page);
      }
      if (selectedGenre && selectedGenre !== "all") {
        return getMoviesByGenre(selectedGenre, page);
      }
      return getMovies(page, 24);
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setSelectedGenre("all");
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery("");
    setPage(1);
  };

  const totalPages = movies?.pagination?.pages || 1;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Search & Filters */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Browse Movies</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar onSearch={handleSearch} />
          
          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full md:w-48 bg-card">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres?.data?.map((g) => (
                <SelectItem key={g.genre} value={g.genre}>
                  {g.genre} ({g.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {searchQuery && (
          <p className="text-muted-foreground">
            Showing results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies?.data?.map((movie) => (
              <MovieCard key={movie.movieId} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft />
              </Button>
              
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
