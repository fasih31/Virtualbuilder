import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Code, Send, Download, Play, Mic, Volume2, Copy, Share2, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GuestBanner } from "@/components/GuestBanner";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { debounce } from "lodash";

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [streaming, setStreaming] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { isGuest } = useAuth();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTestPrompt(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Response copied to clipboard" });
  };

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
      const messages = [
        ...conversationHistory,
        { role: "user", content: prompt }
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider: selectedProvider, 
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          temperature: temperature[0],
          maxTokens: maxTokens[0]
        }),
      });
      if (!response.ok) throw new Error("Test failed");
      return response.json();
    },
    onSuccess: (data) => {
      setTestResponse(data.response);
      setConversationHistory([
        ...conversationHistory,
        { role: "user", content: testPrompt },
        { role: "assistant", content: data.response }
      ]);
      setTestPrompt("");
    },
  });

  const debouncedTestAI = useMemo(
    () => debounce((prompt: string) => testAI.mutate(prompt), 300),
    [testAI.mutate]
  );

  const handleTestPromptChange = (prompt: string) => {
    setTestPrompt(prompt);
    debouncedTestAI(prompt);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold gradient-text">AI Studio</h1>
        <p className="text-muted-foreground">Build intelligent AI applications - 100% Free</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {isGuest && <GuestBanner />}

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Advanced Settings</Label>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-sm">Temperature: {temperature[0]}</Label>
                        <Badge variant="outline">{temperature[0] < 0.3 ? "Precise" : temperature[0] < 0.7 ? "Balanced" : "Creative"}</Badge>
                      </div>
                      <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-sm">Max Tokens: {maxTokens[0]}</Label>
                      </div>
                      <Slider value={maxTokens} onValueChange={setMaxTokens} min={256} max={4096} step={256} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Streaming Response</Label>
                      <Switch checked={streaming} onCheckedChange={setStreaming} />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label>Test Your AI</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter a test prompt or use voice..."
                      value={testPrompt}
                      onChange={(e) => handleTestPromptChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !testAI.isPending && testAI.mutate(testPrompt)}
                    />
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      size="icon"
                      onClick={startVoiceInput}
                      disabled={isListening}
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button onClick={() => testAI.mutate(testPrompt)} disabled={testAI.isPending || !testPrompt}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {conversationHistory.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`p-4 ${msg.role === 'user' ? 'bg-primary/5 border-primary/20' : 'bg-muted'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                              {msg.role === 'user' ? 'You' : 'AI'}
                            </Badge>
                            {msg.role === 'assistant' && (
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(msg.content)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => speakResponse(msg.content)}>
                                  <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse' : ''}`} />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {testAI.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-4"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                    </motion.div>
                  )}
                </div>
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

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <Badge variant="secondary">{testAI.isPending ? '...' : '~1.2s'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tokens Used</span>
                  <Badge variant="secondary">{conversationHistory.length * 100}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Model Quality</span>
                  <Badge className="bg-green-500">Excellent</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                VirtuCopilot Suggestions
              </h3>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="p-3 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                    <p className="text-sm font-medium mb-1">💡 Enable RAG Integration</p>
                    <p className="text-xs text-muted-foreground">Add document knowledge base</p>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="p-3 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🎨 Custom UI Themes</p>
                    <p className="text-xs text-muted-foreground">Match your brand colors</p>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="p-3 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                    <p className="text-sm font-medium mb-1">🔊 Voice Cloning</p>
                    <p className="text-xs text-muted-foreground">AI voice with personality</p>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="p-3 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                    <p className="text-sm font-medium mb-1">📊 Analytics Dashboard</p>
                    <p className="text-xs text-muted-foreground">Track user interactions</p>
                  </Card>
                </motion.div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Project
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export as API
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Code className="w-4 h-4 mr-2" />
                  View Source Code
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}