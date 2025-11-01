
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RefreshCw, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeSandboxProps {
  code: string;
  language: string;
}

export default function CodeSandbox({ code, language }: CodeSandboxProps) {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const runCode = () => {
    setIsRunning(true);
    setOutput("");
    setConsoleOutput([]);

    try {
      if (language === "javascript" || language === "typescript") {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.join(' ')),
          error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('WARN: ' + args.join(' '))
        };

        const wrappedCode = `
          (function() {
            const console = ${JSON.stringify(customConsole)};
            ${code}
          })();
        `;

        eval(wrappedCode);
        setConsoleOutput(logs);
        setOutput("Code executed successfully");
      } else if (language === "html") {
        setOutput(code);
      } else {
        setConsoleOutput(["Language not supported in sandbox"]);
      }

      toast({
        title: "Code Executed",
        description: "Check the output below"
      });
    } catch (error: any) {
      setConsoleOutput([`Error: ${error.message}`]);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopCode = () => {
    setIsRunning(false);
    setOutput("");
    setConsoleOutput([]);
  };

  const reset = () => {
    setOutput("");
    setConsoleOutput([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{language}</Badge>
          {isRunning && (
            <Badge variant="secondary" className="animate-pulse">
              Running...
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isRunning ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={stopCode}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={runCode}
            >
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 bg-slate-950 min-h-64">
        {language === "html" && output ? (
          <iframe
            srcDoc={output}
            className="w-full h-96 border-0 bg-white rounded"
            title="HTML Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-green-400 font-mono">
              {consoleOutput.length > 0 ? (
                consoleOutput.map((line, idx) => (
                  <div key={idx} className="py-1">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  Click "Run" to execute code
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
