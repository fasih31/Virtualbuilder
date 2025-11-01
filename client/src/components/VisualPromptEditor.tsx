
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Wand2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptBlock {
  id: string;
  type: 'context' | 'instruction' | 'constraint' | 'example' | 'output';
  content: string;
}

interface VisualPromptEditorProps {
  onPromptGenerated?: (prompt: string) => void;
  initialPrompt?: string;
}

export default function VisualPromptEditor({ onPromptGenerated, initialPrompt = "" }: VisualPromptEditorProps) {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<PromptBlock[]>([
    { id: '1', type: 'instruction', content: '' }
  ]);
  const [generatedPrompt, setGeneratedPrompt] = useState(initialPrompt);

  const blockTypes = [
    { value: 'context', label: 'Context', color: 'bg-blue-500/10 border-blue-500/20' },
    { value: 'instruction', label: 'Instruction', color: 'bg-purple-500/10 border-purple-500/20' },
    { value: 'constraint', label: 'Constraint', color: 'bg-red-500/10 border-red-500/20' },
    { value: 'example', label: 'Example', color: 'bg-green-500/10 border-green-500/20' },
    { value: 'output', label: 'Output Format', color: 'bg-yellow-500/10 border-yellow-500/20' }
  ];

  const addBlock = (type: string) => {
    const newBlock: PromptBlock = {
      id: Date.now().toString(),
      type: type as PromptBlock['type'],
      content: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const updateBlockType = (id: string, type: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, type: type as PromptBlock['type'] } : b));
  };

  const generatePrompt = () => {
    const sections: Record<string, string[]> = {
      context: [],
      instruction: [],
      constraint: [],
      example: [],
      output: []
    };

    blocks.forEach(block => {
      if (block.content.trim()) {
        sections[block.type].push(block.content);
      }
    });

    let prompt = '';

    if (sections.context.length > 0) {
      prompt += '**Context:**\n' + sections.context.join('\n') + '\n\n';
    }

    if (sections.instruction.length > 0) {
      prompt += '**Instructions:**\n' + sections.instruction.join('\n') + '\n\n';
    }

    if (sections.constraint.length > 0) {
      prompt += '**Constraints:**\n' + sections.constraint.map(c => '- ' + c).join('\n') + '\n\n';
    }

    if (sections.example.length > 0) {
      prompt += '**Examples:**\n' + sections.example.join('\n\n') + '\n\n';
    }

    if (sections.output.length > 0) {
      prompt += '**Output Format:**\n' + sections.output.join('\n') + '\n';
    }

    setGeneratedPrompt(prompt);
    if (onPromptGenerated) {
      onPromptGenerated(prompt);
    }

    toast({
      title: "Prompt Generated!",
      description: "Your structured prompt is ready to use"
    });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: "Copied!", description: "Prompt copied to clipboard" });
  };

  const getBlockColor = (type: string) => {
    return blockTypes.find(t => t.value === type)?.color || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          Visual Prompt Builder
        </h3>
        <div className="flex gap-2">
          {blockTypes.map(type => (
            <Button
              key={type.value}
              size="sm"
              variant="outline"
              onClick={() => addBlock(type.value)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <Card key={block.id} className={`p-4 ${getBlockColor(block.type)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={block.type}
                    onValueChange={(value) => updateBlockType(block.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blockTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">Block {index + 1}</Badge>
                </div>
                <Textarea
                  placeholder={`Enter ${block.type} details...`}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeBlock(block.id)}
                disabled={blocks.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={generatePrompt} className="w-full" size="lg">
        <Wand2 className="w-4 h-4 mr-2" />
        Generate Structured Prompt
      </Button>

      {generatedPrompt && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-semibold">Generated Prompt</Label>
            <Button size="sm" variant="outline" onClick={copyPrompt}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{generatedPrompt}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}
