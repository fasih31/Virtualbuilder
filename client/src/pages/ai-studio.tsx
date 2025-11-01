
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Copy, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AIStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            { role: "user", content: userMessage }
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI request failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: data.response }
      ]);
      setPrompt("");
      toast({ 
        title: "Response generated", 
        description: "AI has responded to your query"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please check your API keys.",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!prompt.trim()) return;
    chatMutation.mutate(prompt);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const clearChat = () => {
    setMessages([]);
    toast({ title: "Chat cleared" });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Studio</h1>
          <p className="text-muted-foreground">Build and test AI applications with multiple providers</p>
        </div>

        <div className="grid gap-6">
          {/* Settings Panel */}
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="mb-2 block">AI Model (Free Gemini)</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={clearChat} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">System Instructions</Label>
              <Textarea
                placeholder="You are a helpful AI assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
              />
            </div>
          </Card>

          {/* Chat Interface */}
          <Card className="p-6">
            <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with AI</p>
                  <p className="text-sm mt-2">Using Free Google Gemini - {model}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}>
                      <Badge variant={msg.role === "user" ? "default" : "secondary"} className="mb-2">
                        {msg.role === "user" ? "You" : "AI"}
                      </Badge>
                      <Card className={`p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        {msg.role === "assistant" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2"
                            onClick={() => copyToClipboard(msg.content)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        )}
                      </Card>
                    </div>
                  </motion.div>
                ))
              )}

              {chatMutation.isPending && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask AI anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !chatMutation.isPending && handleSend()}
              />
              <Button onClick={handleSend} disabled={chatMutation.isPending || !prompt.trim()}>
                {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
