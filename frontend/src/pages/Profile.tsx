import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserRatings } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Star, Film } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { Link } from "react-router-dom";

interface ProfileProps {
  userId: number;
}

const Profile = ({ userId }: ProfileProps) => {
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  const { data: ratingsData, isLoading: loadingRatings } = useQuery({
    queryKey: ["user-ratings", userId],
    queryFn: () => getUserRatings(userId, 1),
  });

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const profile = profileData?.data;
  const ratings = ratingsData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <Card className="p-8 bg-gradient-card">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{profile?.username}</h1>
              {profile?.firstname && profile?.lastname && (
                <p className="text-lg text-muted-foreground">
                  {profile.firstname} {profile.lastname}
                </p>
              )}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-2xl font-bold">{profile?.ratingCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Ratings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{profile?.tagCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Tags</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Ratings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Recent Ratings</h2>
        {loadingRatings ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : ratings.length > 0 ? (
          <div className="space-y-2">
            {ratings.map((rating, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/50 transition-colors">
                <Link to={`/movie/${rating.movieId}`} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{rating.movieTitle || `Movie #${rating.movieId}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rating.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rating.rating} size="sm" />
                    <Badge variant="secondary">{rating.rating}/5</Badge>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">You haven't rated any movies yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
