
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Play, Copy, Download, Loader2, Code, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GameStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [gameCode, setGameCode] = useState("");
  
  const [showCode, setShowCode] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a complete, playable HTML5 game using Canvas API for: ${userPrompt}. 
Include all HTML, CSS, and JavaScript in one complete file. The game must be:
- Fully playable and interactive with smooth animations
- Use HTML5 Canvas for rendering with requestAnimationFrame
- Include game controls (keyboard/mouse) with clear instructions
- Have clear win/lose conditions or scoring system
- Include start screen, gameplay, and game over states
- Be responsive and work on different screen sizes
- Have sound effects (optional, using Web Audio API)
- Include a restart/replay button
Make it fun, polished, visually appealing, and ready to play immediately.`,
          language: "html"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      let code = data.code;
      if (code.includes("```html")) {
        code = code.split("```html")[1].split("```")[0].trim();
      } else if (code.includes("```")) {
        code = code.split("```")[1].split("```")[0].trim();
      }
      
      if (!code.includes("<!DOCTYPE html>") && !code.includes("<html")) {
        code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Game</title>\n</head>\n<body>\n${code}\n</body>\n</html>`;
      }
      
      setGameCode(code);
      toast({ 
        title: "Game generated!", 
        description: "Your game is ready! Click preview to play." 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate game. Please check your API keys.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Please describe your game", variant: "destructive" });
      return;
    }
    generateMutation.mutate(prompt);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast({ title: "Copied to clipboard!" });
  };

  const downloadGame = () => {
    const blob = new Blob([gameCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Game Studio</h1>
          <p className="text-muted-foreground">Create playable games with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Label className="mb-2 block">Describe Your Game (Using Free Gemini AI)</Label>
            <Textarea
              placeholder="Example: Build a 2D platformer where the player controls a character that can jump over obstacles and collect coins. Add enemies that move back and forth. Include a score counter and game over screen. Use arrow keys for movement."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              className="mb-4"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={generateMutation.isPending || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Game
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Game {showCode ? "Code" : "Preview"}</Label>
              {gameCode && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowCode(!showCode)}>
                    {showCode ? <Eye className="w-4 h-4 mr-1" /> : <Code className="w-4 h-4 mr-1" />}
                    {showCode ? "Preview" : "Code"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadGame}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {gameCode ? (
              showCode ? (
                <Textarea
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  rows={28}
                  className="font-mono text-xs"
                />
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                  <iframe
                    srcDoc={gameCode}
                    className="w-full h-full"
                    title="Game Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-lg" style={{ height: '600px' }}>
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate a game to play it here</p>
                <p className="text-sm mt-2">Using Free Google Gemini</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
