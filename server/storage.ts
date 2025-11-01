import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type MarketplaceItem,
  type InsertMarketplaceItem,
  type Conversation,
  type InsertConversation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(id: string, tier: string, stripeCustomerId?: string): Promise<User | undefined>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Marketplace
  getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined>;
  getAllMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItemsByCategory(category: string): Promise<MarketplaceItem[]>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  incrementCloneCount(id: string): Promise<void>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  getConversationsByProject(projectId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, messages: any[], aiProvider?: string): Promise<Conversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private marketplaceItems: Map<string, MarketplaceItem>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.marketplaceItems = new Map();
    this.conversations = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      subscriptionTier: "free",
      stripeCustomerId: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSubscription(id: string, tier: string, stripeCustomerId?: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, subscriptionTier: tier, stripeCustomerId: stripeCustomerId || user.stripeCustomerId };
    this.users.set(id, updated);
    return updated;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description || null,
      content: insertProject.content || {},
      preview: insertProject.preview || null,
      isPublic: insertProject.isPublic || false,
      deployUrl: insertProject.deployUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Marketplace
  async getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined> {
    return this.marketplaceItems.get(id);
  }

  async getAllMarketplaceItems(): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values());
  }

  async getMarketplaceItemsByCategory(category: string): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values()).filter(item => item.category === category);
  }

  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const id = randomUUID();
    const item: MarketplaceItem = {
      ...insertItem,
      id,
      description: insertItem.description || null,
      thumbnail: insertItem.thumbnail || null,
      cloneCount: 0,
      featured: insertItem.featured || false,
      createdAt: new Date(),
    };
    this.marketplaceItems.set(id, item);
    return item;
  }

  async incrementCloneCount(id: string): Promise<void> {
    const item = this.marketplaceItems.get(id);
    if (item) {
      const updated = { ...item, cloneCount: item.cloneCount + 1 };
      this.marketplaceItems.set(id, updated);
    }
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.userId === userId);
  }

  async getConversationsByProject(projectId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.projectId === projectId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      projectId: insertConversation.projectId || null,
      messages: insertConversation.messages || [],
      aiProvider: insertConversation.aiProvider || "openai",
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, messages: any[], aiProvider?: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    const updated = { 
      ...conversation, 
      messages, 
      aiProvider: aiProvider || conversation.aiProvider,
      updatedAt: new Date() 
    };
    this.conversations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
