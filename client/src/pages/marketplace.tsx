import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Star } from "lucide-react";
import type { MarketplaceItem } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "ai", label: "AI Apps" },
  { value: "website", label: "Websites" },
  { value: "bot", label: "Chatbots" },
  { value: "game", label: "Games" },
  { value: "web3", label: "Web3" },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: items = [], isLoading } = useQuery<MarketplaceItem[]>({
    queryKey: ["/api/marketplace", category === "all" ? undefined : category],
  });

  const cloneMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/marketplace/${itemId}/clone`, {
        method: "POST",
      });
    },
    onSuccess: (project: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({
        title: "Project cloned!",
        description: "The project has been added to your dashboard.",
      });
      setLocation(`/studio/${project.type}/${project.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clone project",
        variant: "destructive",
      });
    },
  });

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover, clone, and remix amazing projects from the community
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-marketplace"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48" data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-40 bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No marketplace items yet. Be the first to share your creation!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover-elevate"
                data-testid={`card-item-${item.id}`}
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Star className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" data-testid={`badge-category-${item.id}`}>
                      {item.category}
                    </Badge>
                    {item.featured && <Badge>Featured</Badge>}
                  </div>
                  <h3 className="font-semibold mb-1" data-testid={`text-title-${item.id}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span data-testid={`text-clones-${item.id}`}>{item.cloneCount}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => cloneMutation.mutate(item.id)}
                      disabled={cloneMutation.isPending}
                      data-testid={`button-clone-${item.id}`}
                    >
                      Clone
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
