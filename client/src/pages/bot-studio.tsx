
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, Play, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { value: "discord", label: "Discord", icon: "💬", language: "javascript" },
  { value: "telegram", label: "Telegram", icon: "✈️", language: "python" },
  { value: "slack", label: "Slack", icon: "📱", language: "javascript" },
  { value: "whatsapp", label: "WhatsApp", icon: "📞", language: "python" },
];

const botTemplates = [
  { id: "ai-assistant", name: "AI Assistant", description: "GPT-powered chat bot" },
  { id: "moderation", name: "Moderation Bot", description: "Auto-moderate messages" },
  { id: "crypto", name: "Crypto Bot", description: "Price tracking & alerts" },
  { id: "support", name: "Support Bot", description: "Customer service automation" },
  { id: "game", name: "Game Bot", description: "Trivia & mini-games" },
];

export default function BotStudio() {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [platform, setPlatform] = useState("discord");
  const [template, setTemplate] = useState("");
  const [botToken, setBotToken] = useState("");
  const [commands, setCommands] = useState([{ trigger: "!help", response: "Available commands..." }]);
  const [botCode, setBotCode] = useState("");

  const selectedPlatform = platforms.find(p => p.value === platform);

  const createBot = useMutation({
    mutationFn: async () => {
      const commandsList = commands.map(c => `- ${c.trigger}: ${c.response}`).join('\n');
      const prompt = `Create a fully functional ${platform} bot with the following specifications:

Platform: ${platform}
Template Type: ${template || 'basic'}
Bot Name: ${projectName}

Commands to implement:
${commandsList}

Requirements:
- Use ${selectedPlatform?.language === 'javascript' ? 'discord.js v14 library' : 'python-telegram-bot library'}
- Include proper error handling and logging
- Add event listeners for messages and interactions
- Implement all the specified commands with proper response handling
- Include detailed setup instructions in comments at the top
- Make it production-ready with best practices
- Add environment variable placeholder: BOT_TOKEN (use process.env.BOT_TOKEN for JS, os.getenv for Python)
- Include example .env file content in comments
- Add connection status logging
- Implement graceful shutdown handling

Generate complete, working code with all imports and dependencies that can be deployed immediately.`;
      
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          language: selectedPlatform?.language || "javascript"
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create bot");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      let code = data.code;
      // Extract code from markdown if wrapped
      if (code.includes("```")) {
        const match = code.match(/```(?:javascript|python)?\n([\s\S]*?)```/);
        if (match) {
          code = match[1].trim();
        }
      }
      setBotCode(code);
      toast({ 
        title: "Bot Created!", 
        description: "Your bot code is ready! Download and deploy it." 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addCommand = () => {
    setCommands([...commands, { trigger: "", response: "" }]);
  };

  const removeCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const updateCommand = (index: number, field: 'trigger' | 'response', value: string) => {
    const newCmds = [...commands];
    newCmds[index][field] = value;
    setCommands(newCmds);
  };

  const downloadBot = () => {
    const extension = selectedPlatform?.language === 'javascript' ? 'js' : 'py';
    const blob = new Blob([botCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'bot'}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Bot Studio</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="commands">Commands</TabsTrigger>
                <TabsTrigger value="deploy">Code</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6 mt-6">
                <div>
                  <Label>Bot Name</Label>
                  <Input
                    placeholder="My Awesome Bot"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.icon} {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Language: {selectedPlatform?.language}
                  </p>
                </div>

                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {botTemplates.map((t) => (
                      <Card
                        key={t.id}
                        className={`p-4 cursor-pointer transition-all ${
                          template === t.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setTemplate(t.id)}
                      >
                        <h4 className="font-semibold mb-1">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="commands" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <Label>Bot Commands</Label>
                  <Button size="sm" onClick={addCommand}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Command
                  </Button>
                </div>
                {commands.map((cmd, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Trigger</Label>
                        <Input
                          placeholder="!help"
                          value={cmd.trigger}
                          onChange={(e) => updateCommand(idx, 'trigger', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Response</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Bot response..."
                            value={cmd.response}
                            onChange={(e) => updateCommand(idx, 'response', e.target.value)}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removeCommand(idx)}
                            disabled={commands.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="deploy" className="space-y-4 mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => createBot.mutate()}
                  disabled={!projectName || createBot.isPending}
                >
                  {createBot.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Bot Code
                    </>
                  )}
                </Button>
                
                {botCode && (
                  <>
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Generated Bot Code</h4>
                        <Button size="sm" variant="outline" onClick={downloadBot}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      <pre className="bg-slate-950 p-4 rounded text-green-400 text-sm overflow-x-auto max-h-96">
                        <code>{botCode}</code>
                      </pre>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Bot Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Platform</span>
                <Badge variant="secondary">{selectedPlatform?.label}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commands</span>
                <span className="text-sm font-semibold">{commands.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Status</span>
                <Badge variant={botCode ? "default" : "secondary"}>
                  {botCode ? "Ready" : "Not Generated"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
