import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMarketplaceItemSchema, insertConversationSchema, insertApiKeySchema, insertPromptTemplateSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { deploymentService } from "./deploymentService";
import JSZip from "jszip";
import { aiProvider, encryptApiKey, decryptApiKey } from "./aiProvider";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for deployment monitoring
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Setup authentication
  await setupAuth(app);

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API Keys Management
  app.get("/api/keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keys = await storage.getUserApiKeys(userId);
      // Never return decrypted keys to frontend
      const safeKeys = keys.map(k => ({
        id: k.id,
        provider: k.provider,
        name: k.name,
        isActive: k.isActive,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
      }));
      res.json(safeKeys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { provider, apiKey, name } = req.body;

      if (!provider || !apiKey) {
        return res.status(400).json({ error: "Provider and API key are required" });
      }

      // Encrypt the API key before storing
      const encryptedKey = encryptApiKey(apiKey);

      const validatedData = insertApiKeySchema.parse({
        userId,
        provider,
        encryptedKey,
        name: name || `${provider} Key`,
        isActive: true,
      });

      const key = await storage.createApiKey(validatedData);

      // Don't return the encrypted key
      res.json({
        id: key.id,
        provider: key.provider,
        name: key.name,
        isActive: key.isActive,
        createdAt: key.createdAt,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/keys/:id", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteApiKey(req.params.id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Prompt Templates
  app.get("/api/prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userTemplates = await storage.getUserPromptTemplates(userId);
      const publicTemplates = await storage.getPublicPromptTemplates();
      res.json({ user: userTemplates, public: publicTemplates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPromptTemplateSchema.parse({ ...req.body, userId });
      const template = await storage.createPromptTemplate(validatedData);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.updatePromptTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deletePromptTemplate(req.params.id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Projects API
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Marketplace API
  app.get("/api/marketplace", async (req, res) => {
    try {
      const { category } = req.query;
      const items = category 
        ? await storage.getMarketplaceItemsByCategory(category as string)
        : await storage.getAllMarketplaceItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/marketplace", isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const validatedData = insertMarketplaceItemSchema.parse({ ...req.body, creatorId });
      const item = await storage.createMarketplaceItem(validatedData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/marketplace/:id/clone", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const item = await storage.getMarketplaceItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Marketplace item not found" });
      }

      const originalProject = await storage.getProject(item.projectId);
      if (!originalProject) {
        return res.status(404).json({ error: "Original project not found" });
      }

      const clonedProject = await storage.createProject({
        userId,
        name: `${originalProject.name} (Clone)`,
        type: originalProject.type,
        description: originalProject.description || undefined,
        content: originalProject.content,
        isPublic: false,
      });

      await storage.incrementCloneCount(req.params.id);

      res.json(clonedProject);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Chat API - uses free Gemini only
  app.post("/api/ai/chat", async (req: any, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Get user's Gemini API key or use system key
      let apiKey = process.env.GEMINI_API_KEY || '';
      if (req.user) {
        const userId = req.user.claims.sub;
        const keys = await storage.getUserApiKeys(userId);
        const userKey = keys.find((k: any) => k.provider === 'gemini' && k.isActive);
        
        if (userKey) {
          apiKey = decryptApiKey(userKey.encryptedKey);
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: 'No Gemini API key found. Get a free key at https://makersuite.google.com/app/apikey' 
        });
      }

      const prompt = messages.map((m: any) => m.content).join('\n');
      const response = await aiProvider.generateWithAI({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt,
        apiKey
      });

      res.json({ response, provider: 'gemini' });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Conversations API
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const { messages, aiProvider } = req.body;
      const conversation = await storage.updateConversation(req.params.id, messages, aiProvider);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Template loading
  app.get("/api/templates/:type/:template", async (req, res) => {
    try {
      const { type, template } = req.params;
      const { websiteTemplates, aiTemplates, gameTemplates } = await import("./templates");
      
      let templateData;
      if (type === 'website') templateData = websiteTemplates[template];
      else if (type === 'ai') templateData = aiTemplates[template];
      else if (type === 'game') templateData = gameTemplates[template];
      
      if (!templateData) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(templateData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Code Generation API - uses free Gemini only
  app.post("/api/generate/code", async (req: any, res) => {
    try {
      const { prompt, language = "javascript" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Get user's Gemini API key or use system key
      let apiKey = process.env.GEMINI_API_KEY || '';
      if (req.user) {
        const userId = req.user.claims.sub;
        const keys = await storage.getUserApiKeys(userId);
        const userKey = keys.find((k: any) => k.provider === 'gemini' && k.isActive);
        
        if (userKey) {
          apiKey = decryptApiKey(userKey.encryptedKey);
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: 'No Gemini API key found. Get a free key at https://makersuite.google.com/app/apikey' 
        });
      }

      const fullPrompt = `You are an expert ${language} code generator. Generate clean, well-documented, production-ready code based on the user's requirements. Return ONLY the code, no explanations or markdown.\n\nUser request: ${prompt}`;

      const code = await aiProvider.generateWithAI({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt: fullPrompt,
        apiKey,
        maxTokens: 8192
      });

      res.json({ code, provider: 'gemini', language });
    } catch (error: any) {
      console.error("Code generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Web3 Contract Generation - uses free Gemini
  app.post("/api/web3/create", isAuthenticated, async (req: any, res) => {
    try {
      const { template, name, parameters, prompt: customPrompt } = req.body;
      
      let apiKey = process.env.GEMINI_API_KEY || '';
      if (req.user) {
        const userId = req.user.claims.sub;
        const keys = await storage.getUserApiKeys(userId);
        const userKey = keys.find((k: any) => k.provider === 'gemini' && k.isActive);
        
        if (userKey) {
          apiKey = decryptApiKey(userKey.encryptedKey);
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: 'No Gemini API key found. Get a free key at https://makersuite.google.com/app/apikey' 
        });
      }
      
      let contractPrompt = "";
      if (template === "erc20") {
        contractPrompt = `You are a Solidity smart contract expert. Create a complete, secure ERC-20 token smart contract with the following details:
- Token Name: ${parameters?.tokenName || 'MyToken'}
- Token Symbol: ${parameters?.tokenSymbol || 'MTK'}
- Total Supply: ${parameters?.totalSupply || '1000000'}

Include proper licensing (MIT), OpenZeppelin imports, security features, and detailed comments. Return ONLY the Solidity code.`;
      } else if (template === "erc721") {
        contractPrompt = `You are a Solidity smart contract expert. Create a complete, secure ERC-721 NFT smart contract for ${name || 'MyNFT'}. Include minting functionality, metadata URI support, OpenZeppelin imports, and security features. Return ONLY the Solidity code.`;
      } else {
        contractPrompt = `You are a Solidity smart contract expert. ${customPrompt || "Create a basic, secure smart contract with proper licensing and comments."}. Return ONLY the Solidity code.`;
      }

      const code = await aiProvider.generateWithAI({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt: contractPrompt,
        apiKey,
        maxTokens: 8192
      });

      res.json({ code, template, name });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/web3/audit", async (req: any, res) => {
    try {
      const { code } = req.body;

      let apiKey = process.env.GEMINI_API_KEY || '';
      if (req.user) {
        const userId = req.user.claims.sub;
        const keys = await storage.getUserApiKeys(userId);
        const userKey = keys.find((k: any) => k.provider === 'gemini' && k.isActive);
        
        if (userKey) {
          apiKey = decryptApiKey(userKey.encryptedKey);
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: 'No Gemini API key found. Get a free key at https://makersuite.google.com/app/apikey' 
        });
      }

      const auditPrompt = `You are a smart contract security auditor. Analyze this Solidity smart contract for:
1. Security vulnerabilities (reentrancy, overflow, access control, etc.)
2. Gas optimization opportunities
3. Best practice violations
4. Code quality issues

Smart Contract Code:
${code}

Provide a detailed security audit report with severity levels (Critical, High, Medium, Low) for each finding.`;

      const audit = await aiProvider.generateWithAI({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt: auditPrompt,
        apiKey,
        maxTokens: 8192
      });

      res.json({ audit });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Collaboration Routes
  app.post("/api/projects/:projectId/collaborators", isAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { userId, role = "viewer" } = req.body;
      const collaboration = await storage.addCollaborator({ projectId, userId, role });
      res.json(collaboration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:projectId/collaborators", isAuthenticated, async (req, res) => {
    try {
      const collaborators = await storage.getProjectCollaborators(req.params.projectId);
      res.json(collaborators);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/collaborations/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeCollaborator(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Routes
  app.post("/api/analytics/track", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.trackEvent({ userId, ...req.body });
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/project/:projectId", isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getProjectAnalytics(req.params.projectId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deployment Routes
  app.post("/api/projects/:projectId/deploy", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { projectId } = req.params;
      
      const deployment = await storage.createDeployment({
        projectId,
        userId,
        status: "pending",
      });

      // Simulate deployment process
      setTimeout(async () => {
        await storage.updateDeploymentStatus(
          deployment.id,
          "deployed",
          `https://${projectId}.virtubuild.repl.co`,
          "Build successful"
        );
      }, 3000);

      res.json(deployment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:projectId/deployments", isAuthenticated, async (req, res) => {
    try {
      const deployments = await storage.getDeploymentsByProject(req.params.projectId);
      res.json(deployments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rating Routes
  app.post("/api/marketplace/:itemId/rate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId } = req.params;
      const { rating, review } = req.body;

      const newRating = await storage.addRating({
        marketplaceItemId: itemId,
        userId,
        rating,
        review,
      });

      res.json(newRating);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketplace/:itemId/ratings", async (req, res) => {
    try {
      const ratings = await storage.getItemRatings(req.params.itemId);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Multi-provider deployment
  app.post("/api/deploy/prepare", async (req, res) => {
    try {
      const { projectId, provider, code } = req.body;
      const userId = (req as any).user?.claims?.sub || 'guest';

      const deployment = await deploymentService.createDeploymentPackage({
        projectId,
        userId,
        provider,
        code
      });

      res.json({ files: deployment, provider });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/deploy/download", async (req, res) => {
    try {
      const { files, projectName = 'virtubuild-project' } = req.body;
      
      const zip = new JSZip();
      
      for (const [filename, content] of Object.entries(files)) {
        zip.file(filename, content as string);
      }

      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SEO Tools
  app.post("/api/seo/robots", async (req, res) => {
    try {
      const { domain, disallow = [] } = req.body;
      
      let robotsTxt = `User-agent: *\n`;
      
      if (disallow.length > 0) {
        disallow.forEach((path: string) => {
          robotsTxt += `Disallow: ${path}\n`;
        });
      } else {
        robotsTxt += `Allow: /\n`;
      }
      
      if (domain) {
        robotsTxt += `\nSitemap: https://${domain}/sitemap.xml`;
      }

      res.json({ content: robotsTxt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/seo/sitemap", async (req, res) => {
    try {
      const { domain, pages = ['/'] } = req.body;
      const today = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      pages.forEach((page: string) => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>https://${domain}${page}</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
      });
      
      sitemap += `</urlset>`;

      res.json({ content: sitemap });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SSL Certificate instructions
  app.get("/api/ssl/info", async (req, res) => {
    try {
      const sslInfo = deploymentService.generateSSLInstructions();
      res.json(sslInfo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
