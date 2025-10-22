import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating?: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
}: RatingStarsProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const displayRating = hoveredRating ?? rating;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => interactive && setHoveredRating(starValue)}
            onMouseLeave={() => interactive && setHoveredRating(null)}
            className={cn(
              "transition-all",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-gold text-gold" : "fill-none text-muted",
                interactive && hoveredRating && "animate-pulse"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
