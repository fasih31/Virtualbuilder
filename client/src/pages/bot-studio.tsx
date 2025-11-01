
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
import { Bot, MessageSquare, Zap, Play, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { value: "discord", label: "Discord", icon: "💬" },
  { value: "telegram", label: "Telegram", icon: "✈️" },
  { value: "slack", label: "Slack", icon: "📱" },
  { value: "whatsapp", label: "WhatsApp", icon: "📞" },
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

  const createBot = useMutation({
    mutationFn: async (data: any) => {
      const prompt = `Create a fully functional ${platform} bot with:
- Template: ${template}
- Commands: ${JSON.stringify(commands)}
- Proper error handling
- Platform API integration
- Event listeners
- Ready-to-deploy code
Language: ${platform === "discord" ? "JavaScript (discord.js)" : "Python"}`;
      
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          language: platform === "discord" ? "javascript" : "python",
          provider: "gemini"
        }),
      });
      if (!response.ok) throw new Error("Failed to create bot");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.code) {
        setBotCode(data.code);
      }
      toast({ 
        title: "Bot Created!", 
        description: "Your bot code is ready! Download and deploy it." 
      });
    },
  });

  const addCommand = () => {
    setCommands([...commands, { trigger: "", response: "" }]);
  };

  return (
    <div className="min-h-screen p-6">
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
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
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

                <div>
                  <Label>Bot Token</Label>
                  <Input
                    type="password"
                    placeholder="Your bot token"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your token from {platform === "discord" ? "Discord Developer Portal" : "Bot API"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="commands" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <Label>Bot Commands</Label>
                  <Button size="sm" onClick={addCommand}>
                    + Add Command
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
                          onChange={(e) => {
                            const newCmds = [...commands];
                            newCmds[idx].trigger = e.target.value;
                            setCommands(newCmds);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Response</Label>
                        <Input
                          placeholder="Bot response..."
                          value={cmd.response}
                          onChange={(e) => {
                            const newCmds = [...commands];
                            newCmds[idx].response = e.target.value;
                            setCommands(newCmds);
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="deploy" className="space-y-4 mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    createBot.mutate({
                      name: projectName,
                      platform,
                      template,
                      token: botToken,
                      commands,
                    })
                  }
                  disabled={!projectName || !botToken || createBot.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {createBot.isPending ? "Generating..." : "Generate Bot Code"}
                </Button>
                
                {botCode && (
                  <>
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Generated Bot Code</h4>
                      <pre className="bg-slate-950 p-4 rounded text-green-400 text-sm overflow-x-auto max-h-96">
                        <code>{botCode}</code>
                      </pre>
                    </Card>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const blob = new Blob([botCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${projectName}-bot.${platform === 'discord' ? 'js' : 'py'}`;
                        a.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Bot Code
                    </Button>
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
                <span className="text-sm">Status</span>
                <Badge variant="secondary">Not Deployed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Commands</span>
                <span className="text-sm font-semibold">{commands.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
