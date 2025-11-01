
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Zap, DollarSign, Gauge } from "lucide-react";

interface AIModel {
  id: string;
  provider: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'standard';
  cost: 'free' | 'low' | 'medium' | 'high';
  contextWindow: string;
}

interface ModelSwitcherProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const models: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    description: 'Fast, cost-effective model for most tasks',
    speed: 'fast',
    quality: 'high',
    cost: 'low',
    contextWindow: '128K'
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'Most capable OpenAI model',
    speed: 'medium',
    quality: 'high',
    cost: 'medium',
    contextWindow: '128K'
  },
  {
    id: 'claude-3-5-sonnet',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    description: 'Best for coding and analysis',
    speed: 'medium',
    quality: 'high',
    cost: 'medium',
    contextWindow: '200K'
  },
  {
    id: 'claude-3-haiku',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model',
    speed: 'fast',
    quality: 'medium',
    cost: 'low',
    contextWindow: '200K'
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    name: 'Gemini 1.5 Flash',
    description: 'Google\'s fast multimodal model',
    speed: 'fast',
    quality: 'medium',
    cost: 'free',
    contextWindow: '1M'
  },
  {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    name: 'Gemini 1.5 Pro',
    description: 'Google\'s most capable model',
    speed: 'medium',
    quality: 'high',
    cost: 'low',
    contextWindow: '2M'
  }
];

export default function ModelSwitcher({ selectedModel, onModelChange }: ModelSwitcherProps) {
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'slow': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'text-green-500';
      case 'low': return 'text-blue-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map(model => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {model.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">{currentModel.name}</h4>
            <p className="text-sm text-muted-foreground">{currentModel.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${getSpeedColor(currentModel.speed)}`} />
              <span className="text-sm capitalize">{currentModel.speed} Speed</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-4 h-4 ${getCostColor(currentModel.cost)}`} />
              <span className="text-sm capitalize">{currentModel.cost} Cost</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="text-sm">{currentModel.quality} Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentModel.contextWindow} tokens</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
