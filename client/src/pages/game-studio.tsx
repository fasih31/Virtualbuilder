
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Sparkles, Play, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const engines = [
  { value: "kaboom", label: "Kaboom.js" },
  { value: "pygame", label: "Pygame" },
  { value: "pyxel", label: "Pyxel" },
];

const gameTemplates = [
  { id: "platformer", name: "Platformer", genre: "Action" },
  { id: "shooter", name: "Space Shooter", genre: "Arcade" },
  { id: "puzzle", name: "Puzzle Game", genre: "Puzzle" },
  { id: "rpg", name: "RPG Adventure", genre: "RPG" },
];

export default function GameStudio() {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [engine, setEngine] = useState("kaboom");
  const [template, setTemplate] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const generateGame = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/game-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Generation failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Game Generated!", description: "Your game is ready to play and customize." });
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Game Studio</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="play">Play</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6 mt-6">
                <div>
                  <Label>Game Name</Label>
                  <Input
                    placeholder="My Epic Game"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>AI Game Generator</Label>
                  <Textarea
                    placeholder="Build a 2D platformer with three levels, power-ups, and boss fight..."
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="mt-2"
                  />
                  <Button
                    className="mt-2"
                    onClick={() => generateGame.mutate({ prompt: aiPrompt, name: projectName })}
                    disabled={!aiPrompt || generateGame.isPending}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <Label>Or Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {gameTemplates.map((t) => (
                      <Card
                        key={t.id}
                        className={`p-4 cursor-pointer transition-all ${
                          template === t.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setTemplate(t.id)}
                      >
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.genre}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Game Engine</Label>
                  <Select value={engine} onValueChange={setEngine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {engines.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-4 mt-6">
                <p className="text-muted-foreground">Level designer and sprite editor coming soon...</p>
              </TabsContent>

              <TabsContent value="play" className="mt-6">
                <Card className="h-96 flex items-center justify-center bg-black">
                  <div className="text-center">
                    <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Game preview will appear here</p>
                    <Button className="mt-4">
                      <Play className="w-4 h-4 mr-2" />
                      Play Game
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Generate Sprites
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Create Sound FX
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Add Leaderboard
              </Button>
              <Button className="w-full mt-4">
                <Download className="w-4 h-4 mr-2" />
                Export Game
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
