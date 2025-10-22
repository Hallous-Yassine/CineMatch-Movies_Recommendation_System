import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Filter, TrendingUp } from "lucide-react";

// Mock data for recommendations
const mockRecommendations = [
  {
    id: 1,
    title: "The Quantum Paradox",
    category: "Science Fiction",
    rating: 4.8,
    tags: ["AI", "Future", "Technology"],
    description: "A mind-bending journey through quantum realities and artificial intelligence.",
  },
  {
    id: 2,
    title: "Midnight Symphony",
    category: "Mystery",
    rating: 4.5,
    tags: ["Thriller", "Detective", "Suspense"],
    description: "A detective's race against time to solve a series of mysterious disappearances.",
  },
  {
    id: 3,
    title: "Digital Dreams",
    category: "Technology",
    rating: 4.9,
    tags: ["Innovation", "Startup", "AI"],
    description: "The story of visionaries building the future of artificial intelligence.",
  },
  {
    id: 4,
    title: "Ocean's Whisper",
    category: "Adventure",
    rating: 4.6,
    tags: ["Nature", "Exploration", "Discovery"],
    description: "An underwater expedition revealing secrets of the deep ocean.",
  },
  {
    id: 5,
    title: "Code Warriors",
    category: "Programming",
    rating: 4.7,
    tags: ["Education", "Coding", "Career"],
    description: "Master the art of software development with practical examples.",
  },
  {
    id: 6,
    title: "Stellar Horizons",
    category: "Space",
    rating: 4.9,
    tags: ["Science", "Space", "Astronomy"],
    description: "Explore the wonders of the universe and distant galaxies.",
  },
];

const Recommendations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(mockRecommendations.map(r => r.category)))];

  const filteredRecommendations = mockRecommendations.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="w-6 h-6" />
            <h1 className="text-4xl font-bold">Recommendations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover personalized content recommendations based on your preferences
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search recommendations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] bg-background/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
        </div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((item) => (
            <Card key={item.id} className="card-glow bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{item.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full" variant="gold">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No recommendations found. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
