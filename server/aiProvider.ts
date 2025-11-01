import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptApiKey(encryptedKey: string): string {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIGenerationResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export class AIProviderService {
  private openaiClients: Map<string, OpenAI> = new Map();
  private anthropicClients: Map<string, Anthropic> = new Map();
  private geminiClients: Map<string, GoogleGenerativeAI> = new Map();

  private getOpenAIClient(apiKey?: string): OpenAI | null {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) return null;
    
    if (!this.openaiClients.has(key)) {
      this.openaiClients.set(key, new OpenAI({ apiKey: key }));
    }
    return this.openaiClients.get(key)!;
  }

  private getAnthropicClient(apiKey?: string): Anthropic | null {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    
    if (!this.anthropicClients.has(key)) {
      this.anthropicClients.set(key, new Anthropic({ apiKey: key }));
    }
    return this.anthropicClients.get(key)!;
  }

  private getGeminiClient(apiKey?: string): GoogleGenerativeAI | null {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    
    if (!this.geminiClients.has(key)) {
      this.geminiClients.set(key, new GoogleGenerativeAI(key));
    }
    return this.geminiClients.get(key)!;
  }

  async generate(
    provider: 'openai' | 'anthropic' | 'gemini',
    messages: AIMessage[],
    options: AIGenerationOptions = {},
    apiKey?: string
  ): Promise<AIGenerationResult> {
    switch (provider) {
      case 'openai':
        return this.generateWithOpenAI(messages, options, apiKey);
      case 'anthropic':
        return this.generateWithAnthropic(messages, options, apiKey);
      case 'gemini':
        return this.generateWithGemini(messages, options, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async generateWithOpenAI(
    messages: AIMessage[],
    options: AIGenerationOptions,
    apiKey?: string
  ): Promise<AIGenerationResult> {
    const client = this.getOpenAIClient(apiKey);
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await client.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: messages as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
      model: response.model,
      provider: 'openai',
    };
  }

  private async generateWithAnthropic(
    messages: AIMessage[],
    options: AIGenerationOptions,
    apiKey?: string
  ): Promise<AIGenerationResult> {
    const client = this.getAnthropicClient(apiKey);
    if (!client) {
      throw new Error('Anthropic API key not configured');
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
      provider: 'anthropic',
    };
  }

  private async generateWithGemini(
    messages: AIMessage[],
    options: AIGenerationOptions,
    apiKey?: string
  ): Promise<AIGenerationResult> {
    const client = this.getGeminiClient(apiKey);
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    const model = client.getGenerativeModel({ 
      model: options.model || 'gemini-1.5-flash' 
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    return {
      content: response.text(),
      model: options.model || 'gemini-1.5-flash',
      provider: 'gemini',
    };
  }

  async generateCode(
    prompt: string,
    language: string = 'javascript',
    provider: 'openai' | 'anthropic' | 'gemini' = 'openai',
    options: AIGenerationOptions = {},
    apiKey?: string
  ): Promise<AIGenerationResult> {
    const systemPrompt = `You are an expert code generator. Generate clean, well-documented ${language} code based on the user's requirements. Only return the code, no explanations.`;
    
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    return this.generate(provider, messages, options, apiKey);
  }

  async chat(
    messages: AIMessage[],
    provider: 'openai' | 'anthropic' | 'gemini' = 'openai',
    options: AIGenerationOptions = {},
    apiKey?: string
  ): Promise<AIGenerationResult> {
    return this.generate(provider, messages, options, apiKey);
  }
}

export const aiProvider = new AIProviderService();
