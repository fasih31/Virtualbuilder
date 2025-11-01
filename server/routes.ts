import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMarketplaceItemSchema, insertConversationSchema } from "@shared/schema";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/genai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
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

  app.post("/api/projects", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const validatedData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
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

  app.delete("/api/projects/:id", async (req, res) => {
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

  app.post("/api/marketplace", async (req, res) => {
    try {
      const creatorId = (req as any).user?.id;
      if (!creatorId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const validatedData = insertMarketplaceItemSchema.parse({ ...req.body, creatorId });
      const item = await storage.createMarketplaceItem(validatedData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/marketplace/:id/clone", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
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

  // AI Chat API with multiple providers
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
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
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

  // Code Generation API
  app.post("/api/generate/code", async (req, res) => {
    try {
      const { prompt, language = "javascript", provider = "openai" } = req.body;

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

  const httpServer = createServer(app);

  return httpServer;
}
