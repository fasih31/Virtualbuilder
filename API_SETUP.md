
# VirtuBuild.ai - Complete Setup Guide

## 🚀 Quick Start

VirtuBuild.ai requires AI provider API keys to generate code, websites, games, and bots. Follow this guide to get started.

## 📋 Option 1: Use Your Own API Keys (Recommended)

### Why use your own keys?
- Full control over usage and billing
- No rate limits from shared keys
- Better performance and reliability

### How to add your API keys:

1. **Login to VirtuBuild.ai**
2. **Go to Dashboard → API Keys** (or Settings → API Keys)
3. **Click "Add Key"**
4. **Select provider and paste your key**

### Getting API Keys:

#### OpenAI (GPT Models)
1. Visit: https://platform.openai.com/api-keys
2. Sign up or login
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add to VirtuBuild.ai as "OpenAI"

**Free Credits:** $5 for new accounts

#### Google Gemini (Recommended for free tier)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Add to VirtuBuild.ai as "Gemini"

**Free Tier:** Generous limits, great for development

#### Anthropic Claude
1. Visit: https://console.anthropic.com/
2. Sign up
3. Go to API Keys
4. Create new key
5. Add to VirtuBuild.ai as "Anthropic"

## 📋 Option 2: System Keys (Limited)

If you don't have API keys, VirtuBuild.ai provides limited system keys for testing.

**Note:** System keys have strict rate limits and may not always be available.

## 🔧 For Developers: Environment Setup

If you're running VirtuBuild.ai locally or deploying:

### Required Secrets in Replit:

```bash
# At minimum, add ONE of these:
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...

# Database (already configured if using Replit PostgreSQL)
DATABASE_URL=postgresql://...

# Optional - for encryption (auto-generated if not set)
ENCRYPTION_KEY=your-64-char-hex-key

# Session secret (auto-generated if not set)
SESSION_SECRET=your-secret-key
```

### How to Add Secrets in Replit:

1. Click the **Lock icon** (Secrets) in left sidebar
2. Click **"New secret"**
3. Enter key name (e.g., `OPENAI_API_KEY`)
4. Paste your API key value
5. Click **"Add secret"**
6. **Restart your Repl** (Stop → Run)

## ✅ Testing Your Setup

1. Go to any Studio (AI Studio, Website Studio, etc.)
2. Enter a simple prompt like: "Create a hello world app"
3. Click "Generate"
4. If it works, you're all set! 🎉

## ❌ Troubleshooting

### Error: "No API key found"
- **Solution:** Add your API key in Dashboard → API Keys

### Error: "401 Incorrect API key"
- **Solution:** Check your API key is correct and has billing enabled

### Error: "API key not configured"
- **Solution:** Restart your Repl after adding secrets

### Code generation not working
- **Solution:** Make sure you've selected a provider and added its API key

## 💰 Cost Estimates

- **OpenAI GPT-4o-mini:** ~$0.15 per 1M tokens (very cheap)
- **Gemini 1.5 Flash:** Free tier covers most usage
- **Claude Sonnet:** ~$3 per 1M tokens

**Average cost per generation:** $0.001 - $0.01 (less than a penny!)

## 🎯 Best Practices

1. Start with **Gemini** (free and fast)
2. Use **OpenAI** for complex code generation
3. Use **Claude** for detailed documentation
4. Add multiple keys for redundancy
5. Monitor your usage in provider dashboards

## 🆘 Need Help?

- Check the error message carefully
- Verify your API keys are active
- Ensure billing is enabled on your AI provider account
- Contact support if issues persist

---

**Ready to build?** Add your API key and start creating! 🚀
