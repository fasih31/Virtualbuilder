
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download, Eye, Code, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WebsiteStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [provider, setProvider] = useState("openai");
  const [showPreview, setShowPreview] = useState(true);

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a complete, working HTML page with embedded CSS and JavaScript for: ${userPrompt}. 
Make it modern, responsive, and beautiful. Include all necessary HTML structure, CSS styling in a <style> tag, 
and JavaScript in a <script> tag. Make sure it's a complete, working page. Use modern CSS features like flexbox, grid, and animations.
Ensure the page is fully functional and interactive.`,
          language: "html",
          provider: provider
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
        code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website</title>\n</head>\n<body>\n${code}\n</body>\n</html>`;
      }
      
      setGeneratedCode(code);
      toast({ 
        title: "Website generated!", 
        description: "Your website is ready. Check the preview!" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate website. Please check your API keys in the settings.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }
    generateMutation.mutate(prompt);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Copied to clipboard!" });
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Website Builder</h1>
          <p className="text-muted-foreground">Generate websites with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generator */}
          <Card className="p-6">
            <div className="mb-4">
              <Label className="mb-2 block">AI Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label className="mb-2 block">Describe Your Website</Label>
            <Textarea
              placeholder="Example: Build a modern portfolio website with a hero section, animated gradient background, projects gallery with cards, skills section with icons, and a contact form. Use a dark theme with accent colors."
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
                  Generate Website
                </>
              )}
            </Button>
          </Card>

          {/* Preview & Code */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Output</Label>
              {generatedCode && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <Code className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showPreview ? "Code" : "Preview"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadCode}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            {generatedCode ? (
              <div className="space-y-4">
                {showPreview ? (
                  <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                    <iframe
                      srcDoc={generatedCode}
                      className="w-full h-full"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  <Textarea
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    rows={28}
                    className="font-mono text-xs"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-lg" style={{ height: '600px' }}>
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate a website to see the code and preview</p>
                <p className="text-sm mt-2">Using {provider}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
