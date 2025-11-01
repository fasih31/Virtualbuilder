import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Play, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GameStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [gameCode, setGameCode] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a complete, playable HTML5 game using Canvas API for: ${userPrompt}. Include all HTML, CSS, and JavaScript in one file. Make it fun and interactive.`,
          language: "html",
          provider: "openai"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGameCode(data.code);
      toast({ title: "Game generated!", description: "Your game is ready to play" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate(prompt);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Game Studio</h1>
          <p className="text-muted-foreground">Create games with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Label className="mb-2 block">Describe Your Game</Label>
            <Textarea
              placeholder="Build a 2D platformer where the player jumps over obstacles and collects coins..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="mb-4"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={generateMutation.isPending || !prompt.trim()}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate Game"}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Game Preview</Label>
              {gameCode && (
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(gameCode)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Code
                </Button>
              )}
            </div>

            {gameCode ? (
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  srcDoc={gameCode}
                  className="w-full h-full"
                  title="Game Preview"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-lg" style={{ height: '600px' }}>
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate a game to play it here</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}