
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Play, FileCode, Palette, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onCodeChange?: (html: string, css: string, js: string) => void;
}

export function CodeEditor({ 
  initialHtml = "", 
  initialCss = "", 
  initialJs = "",
  onCodeChange 
}: CodeEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [activeTab, setActiveTab] = useState("html");
  const { toast } = useToast();

  const handleCodeChange = (type: string, value: string) => {
    if (type === "html") setHtml(value);
    else if (type === "css") setCss(value);
    else setJs(value);
    
    onCodeChange?.(
      type === "html" ? value : html,
      type === "css" ? value : css,
      type === "js" ? value : js
    );
  };

  const copyCode = () => {
    const code = activeTab === "html" ? html : activeTab === "css" ? css : js;
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
  };

  const downloadCode = () => {
    const fullCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VirtuBuild Project</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}<\/script>
</body>
</html>
    `;
    
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'virtubuild-project.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <TabsList>
            <TabsTrigger value="html" className="gap-2">
              <FileCode className="w-4 h-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="css" className="gap-2">
              <Palette className="w-4 h-4" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="js" className="gap-2">
              <Code className="w-4 h-4" />
              JavaScript
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadCode}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="html" className="flex-1 m-0 p-0">
          <Textarea
            value={html}
            onChange={(e) => handleCodeChange("html", e.target.value)}
            className="h-full resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0"
            placeholder="Enter HTML code..."
          />
        </TabsContent>

        <TabsContent value="css" className="flex-1 m-0 p-0">
          <Textarea
            value={css}
            onChange={(e) => handleCodeChange("css", e.target.value)}
            className="h-full resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0"
            placeholder="Enter CSS code..."
          />
        </TabsContent>

        <TabsContent value="js" className="flex-1 m-0 p-0">
          <Textarea
            value={js}
            onChange={(e) => handleCodeChange("js", e.target.value)}
            className="h-full resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0"
            placeholder="Enter JavaScript code..."
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
