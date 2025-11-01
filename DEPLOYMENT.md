
# VirtuBuild.ai Deployment Guide

## Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# AI Provider API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Replit Auth (if using Replit Auth)
REPLIT_DB_URL=...

# Session Secret
SESSION_SECRET=your-random-secret-key-here

# Node Environment
NODE_ENV=production
PORT=5000
```

## Deployment on Replit

1. **Set Environment Variables:**
   - Go to Secrets (lock icon in left sidebar)
   - Add all required environment variables from above

2. **Deploy:**
   - Click the "Deploy" button
   - Choose "Autoscale Deployment"
   - Configure:
     - Machine Power: 0.5 vCPU / 512 MB RAM (or higher)
     - Max instances: 3-10 (based on expected traffic)
   - Click "Deploy"

3. **Custom Domain (Optional):**
   - After deployment, go to Deployments tab
   - Click on your deployment
   - Add custom domain in settings

## Database Setup (Supabase)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Wait for database to provision

2. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the connection string
   - Replace password with your actual password
   - Add to `DATABASE_URL` environment variable

3. **Run Migrations:**
   ```bash
   npm run db:push
   ```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] At least one AI provider API key configured
- [ ] Build runs without errors
- [ ] Application starts on port 5000
- [ ] Health check endpoint responds
- [ ] HTTPS enabled (automatic on Replit)
- [ ] Error logging configured
- [ ] Rate limiting enabled (if needed)

## Monitoring

- Access logs in Replit Deployments tab
- Monitor database usage in Supabase dashboard
- Check API usage in OpenAI/Anthropic/Gemini dashboards

## Scaling

The application uses Autoscale deployment which automatically:
- Scales down to 0 when no traffic (saves costs)
- Scales up to handle concurrent requests
- Maintains one warm instance for fast response times

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Ensure IP allowlist includes Replit IPs (or allow all)

### AI Provider Errors
- Verify API keys are valid and have credits
- Check rate limits on provider dashboards
- Ensure correct API key format

### Application Won't Start
- Check logs in Deployments tab
- Verify all required environment variables are set
- Ensure build command completes successfully

## Support

For issues, check:
- Application logs in Replit
- Database logs in Supabase
- API provider status pages
