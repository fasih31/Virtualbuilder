import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Save, Play, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Studio() {
  const { type, id } = useParams<{ type: string; id?: string }>();
  const [code, setCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [aiProvider, setAiProvider] = useState("openai");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (project?.content) {
      setCode((project.content as any).code || "");
      setMessages((project.content as any).messages || []);
    }
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: async (content: any) => {
      return apiRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      toast({ title: "Saved", description: "Project saved successfully" });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (data: { prompt: string; language: string; provider: string }) => {
      return apiRequest("/api/generate/code", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      setCode(data.code);
      saveMutation.mutate({ code: data.code, messages });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { messages: any[]; provider: string }) => {
      return apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      const newMessages = [...messages, { role: "assistant", content: data.response }];
      setMessages(newMessages);
      saveMutation.mutate({ code, messages: newMessages });
      setIsGenerating(false);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ code, messages });
  };

  const handleGenerateCode = () => {
    if (!prompt.trim()) return;
    const language = type === "website" ? "html" : type === "game" ? "javascript" : "javascript";
    generateCodeMutation.mutate({ prompt, language, provider: aiProvider });
  };

  const handleSendMessage = () => {
    if (!prompt.trim()) return;
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setIsGenerating(true);
    chatMutation.mutate({ messages: newMessages, provider: aiProvider });
  };

  const renderStudioContent = () => {
    switch (type) {
      case "ai":
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  Start a conversation with AI to build your application
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${idx}`}
                  >
                    <Card
                      className={`p-4 max-w-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </Card>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <Card className="p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </Card>
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2 mb-2">
                <Select value={aiProvider} onValueChange={setAiProvider}>
                  <SelectTrigger className="w-40" data-testid="select-ai-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI GPT</SelectItem>
                    <SelectItem value="anthropic">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask AI anything..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none"
                  rows={3}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={chatMutation.isPending || !prompt.trim()}
                  data-testid="button-send"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "website":
      case "game":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Code Editor</h3>
                <div className="flex gap-2">
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger className="w-32" data-testid="select-code-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">GPT</SelectItem>
                      <SelectItem value="anthropic">Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1 p-4">
                <Textarea
                  placeholder={`Enter ${type === "website" ? "HTML/CSS/JS" : "game"} code here...`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm resize-none h-full"
                  data-testid="textarea-code"
                />
              </div>
              <div className="p-4 border-t">
                <Textarea
                  placeholder="Describe what you want to build..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="resize-none mb-2"
                  rows={2}
                  data-testid="input-code-prompt"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateCode}
                    disabled={generateCodeMutation.isPending}
                    className="flex-1"
                    data-testid="button-generate-code"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {generateCodeMutation.isPending ? "Generating..." : "Generate Code"}
                  </Button>
                  <Button onClick={handleSave} variant="outline" data-testid="button-save-code">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col border-l">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Preview</h3>
              </div>
              <div className="flex-1 p-4 bg-white">
                <iframe
                  srcDoc={code}
                  className="w-full h-full border rounded"
                  title="Preview"
                  sandbox="allow-scripts"
                  data-testid="iframe-preview"
                />
              </div>
            </div>
          </div>
        );

      case "bot":
      case "web3":
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="p-12 text-center max-w-md">
              <h3 className="text-2xl font-semibold mb-4">
                {type === "bot" ? "Bot Studio" : "Web3 Studio"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {type === "bot"
                  ? "Build conversational AI chatbots with natural language understanding"
                  : "Create blockchain applications and smart contracts"}
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-project-name">
            {project?.name || "New Project"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type?.charAt(0).toUpperCase() + type?.slice(1)} Studio
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-project">
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Project"}
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">{renderStudioContent()}</div>
    </div>
  );
}
