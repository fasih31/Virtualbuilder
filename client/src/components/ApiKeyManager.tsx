import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI", color: "bg-green-500" },
  { value: "anthropic", label: "Anthropic", color: "bg-orange-500" },
  { value: "gemini", label: "Google Gemini", color: "bg-blue-500" },
  { value: "cohere", label: "Cohere", color: "bg-purple-500" },
];

export function ApiKeyManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [keyName, setKeyName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const { data: keys = [] } = useQuery<any[]>({
    queryKey: ["/api/keys"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string; name?: string }) => {
      return apiRequest("/api/keys", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setIsOpen(false);
      setApiKey("");
      setKeyName("");
      toast({
        title: "API Key Added",
        description: "Your API key has been securely encrypted and stored.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add API key",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/keys/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Deleted",
        description: "Your API key has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ provider, apiKey, name: keyName });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">API Keys</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-key">
              <Plus className="w-4 h-4 mr-2" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add AI Provider API Key</DialogTitle>
              <DialogDescription>
                Your API key will be encrypted and stored securely. It will never be exposed to the client.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Key Name (Optional)</Label>
                <Input
                  data-testid="input-key-name"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="My Production Key"
                />
              </div>

              <div>
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    data-testid="input-api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowKey(!showKey)}
                    data-testid="button-toggle-visibility"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-save-key">
                {createMutation.isPending ? "Adding..." : "Add API Key"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No API keys configured yet</p>
          <p className="text-sm mt-2">Add your AI provider API keys to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const providerInfo = AI_PROVIDERS.find((p) => p.value === key.provider);
            return (
              <Card key={key.id} className="p-4" data-testid={`card-key-${key.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${providerInfo?.color || "bg-gray-500"}`} />
                    <div>
                      <div className="font-medium" data-testid={`text-provider-${key.id}`}>
                        {providerInfo?.label || key.provider}
                      </div>
                      {key.name && (
                        <div className="text-sm text-muted-foreground" data-testid={`text-key-name-${key.id}`}>
                          {key.name}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Added {format(new Date(key.createdAt), "MMM d, yyyy")}
                        {key.lastUsed && ` • Last used ${format(new Date(key.lastUsed), "MMM d, yyyy")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.isActive && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(key.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${key.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
