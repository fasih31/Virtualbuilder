import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Keyboard, Zap, Code, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function VirtuCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hi! I'm VirtuCopilot, your AI assistant. How can I help you build today?",
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Build a landing page with hero section",
    "Create a REST API with authentication",
    "Design a dashboard with charts",
    "Generate a chatbot interface"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessages: any[]) => {
      return apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: userMessages,
          provider: "openai",
        }),
      });
    },
    onSuccess: (data: any) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim()) return;

    const userMessage = { role: "user", content: messageText };
    setMessages([...messages, userMessage]);
    setInput("");

    chatMutation.mutate([...messages, userMessage]);
  };

  if (!isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            size="icon"
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-shadow relative overflow-hidden group"
            onClick={() => setIsOpen(true)}
            data-testid="button-open-copilot"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-7 h-7 relative z-10" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 w-[28rem] h-[600px] z-50"
      >
        <Card className="h-full shadow-2xl flex flex-col border-2 border-primary/20 overflow-hidden" data-testid="card-copilot">
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h3 className="font-semibold">VirtuCopilot</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  Press Cmd+K
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-copilot"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
                <h4 className="font-semibold text-lg mb-2">Welcome to VirtuCopilot!</h4>
                <p className="text-sm text-muted-foreground mb-6">Your AI-powered development assistant</p>

                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setInput(suggestion);
                          handleSend(suggestion);
                        }}
                      >
                        <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                        <span className="text-sm">{suggestion}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`copilot-message-${idx}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
                        : "bg-muted border border-border shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.role === "assistant" && msg.code && (
                      <div className="mt-2 p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <Code className="w-3 h-3 mr-1" />
                            Code
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-6">
                            Copy
                          </Button>
                        </div>
                        <pre className="text-xs text-green-400 overflow-x-auto">
                          {msg.code}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3 border border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask VirtuCopilot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="resize-none"
                data-testid="input-copilot"
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={chatMutation.isPending || !input.trim()}
                className="h-auto"
                data-testid="button-send-copilot"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Powered by advanced AI models
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}