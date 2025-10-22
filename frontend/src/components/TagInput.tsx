import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface TagInputProps {
  existingTags: string[];
  onAddTag: (tag: string) => void;
}

const TagInput = ({ existingTags, onAddTag }: TagInputProps) => {
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag (e.g., 'mind-bending', 'classic')"
          maxLength={50}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newTag.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </form>
      
      {existingTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingTags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="gap-1">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
