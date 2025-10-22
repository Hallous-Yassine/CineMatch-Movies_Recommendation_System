import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Tags, TrendingUp, Users, Play } from "lucide-react";
import heroCinema from "@/assets/hero-cinema.jpg";

// Mock popular movies data
const popularMovies = [
  {
    id: 1,
    title: "Inception",
    rating: 4.8,
    year: "2010",
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop"
  },
  {
    id: 2,
    title: "The Dark Knight",
    rating: 4.9,
    year: "2008",
    genre: "Action",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop"
  },
  {
    id: 3,
    title: "Interstellar",
    rating: 4.7,
    year: "2014",
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop"
  },
  {
    id: 4,
    title: "Pulp Fiction",
    rating: 4.8,
    year: "1994",
    genre: "Crime",
    image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=450&fit=crop"
  },
  {
    id: 5,
    title: "The Matrix",
    rating: 4.7,
    year: "1999",
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=300&h=450&fit=crop"
  },
  {
    id: 6,
    title: "Parasite",
    rating: 4.9,
    year: "2019",
    genre: "Thriller",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop"
  },
];

const Home = () => {
  const stats = [
    { label: "Active Users", value: "10K+", icon: Users, color: "text-primary" },
    { label: "Recommendations", value: "50K+", icon: Sparkles, color: "text-accent" },
    { label: "Ratings", value: "25K+", icon: Star, color: "text-yellow-500" },
    { label: "Categories", value: "100+", icon: Tags, color: "text-green-500" },
  ];

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
            Discover Your Next
            <span className="gradient-text"> Favorite Movie</span>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularMovies.map((movie) => (
              <Card 
                key={movie.id} 
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
                    <span className="text-xs font-semibold">{movie.rating}</span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-1 truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{movie.year}</span>
                    <span>{movie.genre}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
