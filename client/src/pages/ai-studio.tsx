
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Code, Send, Download, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const llmProviders = [
  { value: "openai", label: "OpenAI GPT-4", icon: "🤖" },
  { value: "gemini", label: "Google Gemini", icon: "✨" },
  { value: "anthropic", label: "Claude", icon: "🧠" },
  { value: "cohere", label: "Cohere", icon: "💫" },
];

const templates = [
  { id: "chat", name: "Chat Assistant", description: "Interactive conversational AI" },
  { id: "writer", name: "Blog Writer", description: "Generate blog content" },
  { id: "debugger", name: "Code Debugger", description: "Fix code errors" },
  { id: "tutor", name: "AI Tutor", description: "Educational assistant" },
  { id: "copywriter", name: "Marketing Copy", description: "Marketing content generator" },
  { id: "custom", name: "Custom", description: "Build from scratch" },
];

export default function AIStudio() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [projectName, setProjectName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testPrompt, setTestPrompt] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const createProject = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ai-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "AI Project Created!", description: "Your AI app is ready to deploy." });
    },
  });

  const testAI = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, system: systemPrompt, prompt }),
      });
      if (!response.ok) throw new Error("Test failed");
      return response.json();
    },
    onSuccess: (data) => {
      setTestResponse(data.response);
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">AI Studio</h1>
          <Badge variant="secondary" className="ml-auto">Powered by VirtuCopilot</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-6 mt-6">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    placeholder="My AI Assistant"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Select Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <h4 className="font-semibold mb-1">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>LLM Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {llmProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.icon} {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    placeholder="You are a helpful assistant..."
                    rows={6}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4 mt-6">
                <div>
                  <Label>Test Your AI</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter a test prompt..."
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                    />
                    <Button onClick={() => testAI.mutate(testPrompt)} disabled={testAI.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {testResponse && (
                  <Card className="p-4 bg-muted">
                    <p className="text-sm">{testResponse}</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="deploy" className="space-y-4 mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    createProject.mutate({
                      name: projectName,
                      template: selectedTemplate,
                      provider: selectedProvider,
                      systemPrompt,
                    })
                  }
                  disabled={createProject.isPending || !projectName}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Deploy AI App
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Code
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              VirtuCopilot Suggestions
            </h3>
            <div className="space-y-3">
              <Card className="p-3 bg-primary/5 border-primary/20">
                <p className="text-sm">💡 Add conversation memory for context</p>
              </Card>
              <Card className="p-3 bg-primary/5 border-primary/20">
                <p className="text-sm">🎨 Customize chat UI with themes</p>
              </Card>
              <Card className="p-3 bg-primary/5 border-primary/20">
                <p className="text-sm">🔊 Enable voice input/output</p>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
