
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Download, 
  Copy, 
  Check, 
  Save, 
  Eye, 
  Code2, 
  Maximize2,
  Settings,
  FileCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Split from "react-split";
import { saveAs } from "file-saver";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parserCss from "prettier/parser-postcss";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => void;
  showPreview?: boolean;
  projectName?: string;
}

export default function CodeEditor({
  initialCode = "",
  language = "javascript",
  onRun,
  showPreview = true,
  projectName = "untitled"
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "code" | "preview">("split");
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`code_${projectName}`, code);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, projectName]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
    }
    
    // For demo purposes, simulate output
    try {
      if (language === "javascript") {
        const result = eval(code);
        setOutput(String(result));
      } else if (language === "html") {
        setOutput(code);
      }
      toast({
        title: "Code executed",
        description: "Check the preview panel for output",
      });
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Execution error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const extension = language === "javascript" ? "js" : language === "python" ? "py" : language;
    saveAs(blob, `${projectName}.${extension}`);
    toast({
      title: "Downloaded",
      description: `${projectName}.${extension} saved`,
    });
  };

  const handleFormat = async () => {
    try {
      let formatted = code;
      if (language === "javascript" || language === "typescript") {
        formatted = await prettier.format(code, {
          parser: "babel",
          plugins: [parserBabel],
        });
      } else if (language === "html") {
        formatted = await prettier.format(code, {
          parser: "html",
          plugins: [parserHtml],
        });
      } else if (language === "css") {
        formatted = await prettier.format(code, {
          parser: "css",
          plugins: [parserCss],
        });
      }
      setCode(formatted);
      toast({
        title: "Formatted",
        description: "Code has been formatted",
      });
    } catch (error) {
      toast({
        title: "Format error",
        description: "Could not format code",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <Card className="p-3 mb-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            <FileCode className="w-3 h-3 mr-1" />
            {language}
          </Badge>
          {saved && (
            <Badge variant="outline" className="text-green-500 border-green-500">
              <Check className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === "split" ? "code" : viewMode === "code" ? "preview" : "split")}
          >
            {viewMode === "split" && <Maximize2 className="w-4 h-4 mr-1" />}
            {viewMode === "code" && <Eye className="w-4 h-4 mr-1" />}
            {viewMode === "preview" && <Code2 className="w-4 h-4 mr-1" />}
            {viewMode}
          </Button>
          <Button size="sm" variant="outline" onClick={handleFormat}>
            <Settings className="w-4 h-4 mr-1" />
            Format
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={handleRun}>
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
      </Card>

      {/* Editor and Preview */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "code" ? (
          <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        ) : viewMode === "preview" && showPreview ? (
          <Card className="h-full p-4 overflow-auto bg-white dark:bg-gray-900">
            {language === "html" ? (
              <iframe
                srcDoc={output || code}
                className="w-full h-full border-0"
                title="Preview"
              />
            ) : (
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {output || "Run code to see output"}
              </pre>
            )}
          </Card>
        ) : (
          <Split
            className="flex h-full"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={8}
            direction="horizontal"
          >
            <div className="overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                }}
              />
            </div>
            {showPreview && (
              <Card className="h-full p-4 overflow-auto bg-white dark:bg-gray-900">
                {language === "html" ? (
                  <iframe
                    srcDoc={output || code}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                ) : (
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {output || "Run code to see output"}
                  </pre>
                )}
              </Card>
            )}
          </Split>
        )}
      </div>
    </div>
  );
}
