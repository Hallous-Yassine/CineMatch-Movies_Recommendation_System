import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Tag as TagIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

// Mock rated items
const mockRatedItems = [
  {
    id: 1,
    title: "The Quantum Paradox",
    rating: 5,
    tags: ["AI", "Future", "Technology"],
    review: "Absolutely mind-blowing! The concept of quantum realities was brilliantly executed.",
    date: "2024-03-15",
  },
  {
    id: 2,
    title: "Midnight Symphony",
    rating: 4,
    tags: ["Thriller", "Detective"],
    review: "Great mystery with unexpected twists. Kept me engaged throughout.",
    date: "2024-03-10",
  },
];

const Ratings = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [review, setReview] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    toast.success("Rating submitted successfully!");
    // Reset form
    setSelectedRating(0);
    setTags([]);
    setReview("");
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Star className="w-6 h-6 fill-current" />
            <h1 className="text-4xl font-bold">Ratings & Tags</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Rate content and add tags to improve your recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add New Rating */}
          <Card className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Add New Rating</CardTitle>
              <CardDescription>
                Rate an item and add custom tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Item Selection */}
              <div className="space-y-2">
                <Label>Select Item</Label>
                <Input placeholder="Search for an item to rate..." className="bg-background/50" />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setSelectedRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          rating <= (hoveredRating || selectedRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Add Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    className="bg-background/50"
                  />
                  <Button onClick={handleAddTag} size="icon" variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1">
                        <TagIcon className="w-3 h-3 mr-1" />
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

              {/* Review */}
              <div className="space-y-2">
                <Label>Review (Optional)</Label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px] bg-background/50"
                />
              </div>

              <Button onClick={handleSubmitRating} className="w-full" variant="gold">
                Submit Rating
              </Button>
            </CardContent>
          </Card>

          {/* Your Ratings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Ratings</h2>
            {mockRatedItems.map((item) => (
              <Card key={item.id} className="card-glow bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold">{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{item.review}</p>
                  <p className="text-xs text-muted-foreground">
                    Rated on {new Date(item.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;
