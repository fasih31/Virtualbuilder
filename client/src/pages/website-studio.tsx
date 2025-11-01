import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WebsiteStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const response = await fetch("/api/generate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a complete, working HTML page with embedded CSS and JavaScript for: ${userPrompt}. Make it modern and responsive.`,
          language: "html",
          provider: "openai"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      toast({ title: "Website generated!", description: "Your code is ready" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
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
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Website Builder</h1>
          <p className="text-muted-foreground">Generate websites with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generator */}
          <Card className="p-6">
            <Label className="mb-2 block">Describe Your Website</Label>
            <Textarea
              placeholder="Build a modern portfolio website with a hero section, projects gallery, and contact form..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="mb-4"
            />
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate Website"}
            </Button>
          </Card>

          {/* Preview & Code */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Generated Code</Label>
              {generatedCode && (
                <div className="flex gap-2">
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
              <>
                <div className="mb-4 border rounded-lg overflow-hidden h-64">
                  <iframe
                    srcDoc={generatedCode}
                    className="w-full h-full"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                </div>
                <Textarea
                  value={generatedCode}
                  onChange={(e) => setGeneratedCode(e.target.value)}
                  rows={15}
                  className="font-mono text-xs"
                />
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate a website to see the code and preview</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}