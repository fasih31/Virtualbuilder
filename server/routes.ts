import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMarketplaceItemSchema, insertConversationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deploymentService } from "./deploymentService";
import JSZip from "jszip";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // AI Chat API with multiple providers (accessible to guests)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, provider = "openai", model } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      let response;

      switch (provider) {
        case "openai":
          const openaiResponse = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: messages,
            stream: false,
          });
          response = openaiResponse.choices[0].message.content;
          break;

        case "anthropic":
          const anthropicResponse = await anthropic.messages.create({
            model: model || "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            messages: messages.filter((m: any) => m.role !== "system"),
            system: messages.find((m: any) => m.role === "system")?.content || undefined,
          });
          response = anthropicResponse.content[0].type === "text" 
            ? anthropicResponse.content[0].text 
            : "";
          break;

        case "gemini":
          const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });
          const chat = geminiModel.startChat({
            history: messages.slice(0, -1).map((m: any) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          });
          const lastMessage = messages[messages.length - 1];
          const geminiResponse = await chat.sendMessage(lastMessage.content);
          response = geminiResponse.response.text();
          break;

        default:
          return res.status(400).json({ error: "Invalid AI provider" });
      }

      res.json({ response, provider });
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

  // Code Generation API (accessible to guests)
  app.post("/api/generate/code", async (req, res) => {
    try {
      const { prompt, language = "javascript", provider = "openai" } = req.body;


  // Web3 Contract Generation
  app.post("/api/web3/create", isAuthenticated, async (req, res) => {
    try {
      const { template, name, parameters } = req.body;
      
      const systemPrompt = `You are a Solidity smart contract expert. Generate secure, well-documented smart contracts based on the user's requirements. Follow best practices and include comments.`;
      
      let contractPrompt = "";
      if (template === "erc20") {
        contractPrompt = `Create an ERC-20 token contract with name: ${parameters.tokenName}, symbol: ${parameters.tokenSymbol}, total supply: ${parameters.totalSupply}`;
      } else if (template === "erc721") {
        contractPrompt = `Create an ERC-721 NFT contract for ${name}`;
      } else {
        contractPrompt = req.body.prompt || "Create a basic smart contract";
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contractPrompt }
        ],
      });

      const code = response.choices[0].message.content;
      res.json({ code, template, name });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/web3/audit", async (req, res) => {
    try {
      const { code } = req.body;

      const auditPrompt = `Analyze this Solidity smart contract for security vulnerabilities, gas optimization issues, and best practice violations:\n\n${code}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a smart contract security auditor. Provide detailed security analysis." },
          { role: "user", content: auditPrompt }
        ],
      });

      const audit = response.choices[0].message.content;
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


      const systemPrompt = `You are an expert code generator. Generate clean, well-documented ${language} code based on the user's requirements. Only return the code, no explanations.`;
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ];

      let code;

      switch (provider) {
        case "openai":
          const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
          });
          code = openaiResponse.choices[0].message.content;
          break;

        case "anthropic":
          const anthropicResponse = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
            system: systemPrompt,
          });
          code = anthropicResponse.content[0].type === "text" 
            ? anthropicResponse.content[0].text 
            : "";
          break;

        default:
          return res.status(400).json({ error: "Invalid provider" });
      }

      res.json({ code, provider });
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
