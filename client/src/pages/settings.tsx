
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Trash2, Plus, Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const { toast } = useToast();
  const [newProvider, setNewProvider] = useState("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [showKey, setShowKey] = useState(false);

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["/api/keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setNewApiKey("");
      setNewKeyName("");
      toast({ title: "API Key Added!", description: "Your key has been securely stored." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete API key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({ title: "API Key Deleted" });
    },
  });

  const handleAddKey = () => {
    if (!newApiKey.trim()) {
      toast({ title: "Error", description: "API key is required", variant: "destructive" });
      return;
    }
    createKeyMutation.mutate({
      provider: newProvider,
      apiKey: newApiKey,
      name: newKeyName || `${newProvider} Key`,
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        </div>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Add New API Key</h3>
              <div className="space-y-4">
                <div>
                  <Label>Provider</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-lg"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <Label>Key Name (Optional)</Label>
                  <Input
                    placeholder="My OpenAI Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleAddKey} disabled={createKeyMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Key
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your API Keys</h3>
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No API keys configured. Add one above to get started.
                  </p>
                ) : (
                  apiKeys.map((key: any) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{key.provider}</Badge>
                            {key.isActive && <Badge variant="default">Active</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKeyMutation.mutate(key.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Application Preferences</h3>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
