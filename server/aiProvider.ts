import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

// Default to free Gemini API
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptApiKey(encryptedKey: string): string {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

interface AIGenerateOptions {
  provider: string;
  model: string;
  prompt: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateWithAI(options: AIGenerateOptions): Promise<string> {
  const { provider = 'gemini', model, prompt, apiKey, temperature = 0.7, maxTokens = 4096 } = options;

  try {
    // Always use Gemini (free) by default
    const finalProvider = provider === 'openai' || provider === 'anthropic' ? 'gemini' : provider;
    const finalApiKey = apiKey || DEFAULT_GEMINI_KEY;
    
    if (!finalApiKey) {
      throw new Error('No Gemini API key found. Please add GEMINI_API_KEY in Secrets or provide your own in Settings.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${finalApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    throw new Error(`AI Generation failed: ${error.message}`);
  }
}

export const aiProvider = {
  generateWithAI,
  encryptApiKey,
  decryptApiKey
};