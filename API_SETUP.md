# API Setup Guide

VirtuBuild.ai requires API keys from AI providers to function. You need at least ONE of the following:

## Quick Start

1. Get API keys from your preferred AI provider(s)
2. Add them to Replit Secrets (lock icon in sidebar)
3. Restart the application

## Supported AI Providers

VirtuBuild.ai works with multiple AI providers. Configure at least one:

### 1. OpenAI (Required for AI Studio, Website Builder, Game Studio, Bot Studio)
- Get your API key from: https://platform.openai.com/api-keys
- Add to Replit Secrets:
  - Key: `OPENAI_API_KEY`
  - Value: `sk-...` (your API key)

### 2. Anthropic Claude (Optional - for Claude models)
- Get your API key from: https://console.anthropic.com/
- Add to Replit Secrets:
  - Key: `ANTHROPIC_API_KEY`
  - Value: `sk-ant-...` (your API key)

### 3. Google Gemini (Optional - for Gemini models)
- Get your API key from: https://makersuite.google.com/app/apikey
- Add to Replit Secrets:
  - Key: `GEMINI_API_KEY`
  - Value: Your API key

## How to Add Secrets in Replit

1. Click on "Secrets" in the left sidebar (lock icon)
2. Click "New secret"
3. Enter the key name (e.g., `OPENAI_API_KEY`)
4. Enter your API key value
5. Click "Add secret"

## Testing the Setup

After adding your API keys:
1. Restart your Repl
2. Go to any studio (AI Studio, Website Builder, etc.)
3. Try generating content
4. If you see "API key not configured" errors, check that:
   - Secret names match exactly (case-sensitive)
   - API keys are valid
   - You've restarted the Repl after adding secrets

## Free Tier Limits

- OpenAI: $5 free credits for new accounts
- Anthropic: Limited free tier
- Gemini: Generous free tier

For production use, you'll need to add billing to your AI provider accounts.