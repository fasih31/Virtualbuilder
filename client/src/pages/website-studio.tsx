
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Palette, Code, Smartphone, Monitor, Download, ExternalLink, Eye, FileCode, Layers, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const frameworks = [
  { value: "react", label: "React + Vite" },
  { value: "nextjs", label: "Next.js" },
  { value: "html", label: "HTML/CSS/JS" },
  { value: "flask", label: "Flask" },
];

const websiteTemplates = [
  { id: "portfolio", name: "Portfolio", preview: "Personal showcase site" },
  { id: "landing", name: "Landing Page", preview: "Product/service landing" },
  { id: "blog", name: "Blog", preview: "Content publishing site" },
  { id: "saas", name: "SaaS Dashboard", preview: "Web application UI" },
  { id: "ecommerce", name: "E-Commerce", preview: "Online store" },
];

const colorThemes = [
  { name: "Neon Purple", primary: "#6c63ff", secondary: "#00d4ff" },
  { name: "Ocean Blue", primary: "#0080ff", secondary: "#00ffaa" },
  { name: "Sunset Orange", primary: "#ff6b6b", secondary: "#ffd93d" },
  { name: "Forest Green", primary: "#27ae60", secondary: "#82e0aa" },
];

export default function WebsiteStudio() {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState("react");
  const [template, setTemplate] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [htmlCode, setHtmlCode] = useState("<h1>Welcome to VirtuBuild</h1>");
  const [cssCode, setCssCode] = useState("body { font-family: sans-serif; }");
  const [jsCode, setJsCode] = useState("console.log('Hello World');");
  const [activeEditor, setActiveEditor] = useState<"html" | "css" | "js">("html");
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    const fullCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}<\/script>
        </body>
      </html>
    `;
    setPreviewContent(fullCode);
  }, [htmlCode, cssCode, jsCode]);

  const generateSite = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/website-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Generation failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Website Generated!", description: "Your site is ready to customize." });
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Website Studio</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="generate">Generate</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-6 mt-6">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    placeholder="My Awesome Website"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>AI Website Builder</Label>
                  <Textarea
                    placeholder="Describe your website: 'Build a modern portfolio with dark mode, contact form, and project showcase...'"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="mt-2"
                  />
                  <Button
                    className="mt-2"
                    onClick={() => generateSite.mutate({ prompt: aiPrompt, name: projectName })}
                    disabled={!aiPrompt || generateSite.isPending}
                  >
                    Generate with AI
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <Label>Or Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {websiteTemplates.map((t) => (
                      <Card
                        key={t.id}
                        className={`p-4 cursor-pointer transition-all ${
                          template === t.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setTemplate(t.id)}
                      >
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.preview}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Framework</Label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-6 mt-6">
                <div>
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {colorThemes.map((theme) => (
                      <Card
                        key={theme.name}
                        className={`p-4 cursor-pointer ${
                          selectedTheme.name === theme.name ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <div className="flex gap-2 mb-2">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: theme.secondary }}
                          />
                        </div>
                        <p className="text-sm font-medium">{theme.name}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6 h-[600px]">
                <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                        <Button
                          variant={activeEditor === "html" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setActiveEditor("html")}
                        >
                          <FileCode className="w-4 h-4 mr-1" />
                          HTML
                        </Button>
                        <Button
                          variant={activeEditor === "css" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setActiveEditor("css")}
                        >
                          <Palette className="w-4 h-4 mr-1" />
                          CSS
                        </Button>
                        <Button
                          variant={activeEditor === "js" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setActiveEditor("js")}
                        >
                          <Code className="w-4 h-4 mr-1" />
                          JS
                        </Button>
                      </div>
                      <div className="flex-1 p-4 overflow-auto bg-slate-950">
                        <Textarea
                          value={activeEditor === "html" ? htmlCode : activeEditor === "css" ? cssCode : jsCode}
                          onChange={(e) => {
                            if (activeEditor === "html") setHtmlCode(e.target.value);
                            else if (activeEditor === "css") setCssCode(e.target.value);
                            else setJsCode(e.target.value);
                          }}
                          className="min-h-full font-mono text-sm bg-transparent border-none focus-visible:ring-0 text-green-400"
                          placeholder={`Enter ${activeEditor.toUpperCase()} code...`}
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Live Preview</span>
                        <div className="ml-auto flex gap-1">
                          <Button
                            variant={previewMode === "desktop" ? "default" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPreviewMode("desktop")}
                          >
                            <Monitor className="w-3 h-3" />
                          </Button>
                          <Button
                            variant={previewMode === "tablet" ? "default" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPreviewMode("tablet")}
                          >
                            <Smartphone className="w-3 h-3 rotate-90" />
                          </Button>
                          <Button
                            variant={previewMode === "mobile" ? "default" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPreviewMode("mobile")}
                          >
                            <Smartphone className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-white p-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`bg-white shadow-xl rounded-lg overflow-hidden ${
                            previewMode === "desktop" ? "w-full h-full" :
                            previewMode === "tablet" ? "w-[768px] h-[1024px]" :
                            "w-[375px] h-[667px]"
                          }`}
                        >
                          <iframe
                            srcDoc={previewContent}
                            className="w-full h-full border-0"
                            title="Website Preview"
                            sandbox="allow-scripts"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="deploy" className="space-y-4 mt-6">
                <Button className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Deploy to Replit
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Code className="w-4 h-4 mr-2" />
                Add Section
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                SEO Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Analytics Setup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
