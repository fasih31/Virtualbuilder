import {
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type MarketplaceItem,
  type InsertMarketplaceItem,
  type Conversation,
  type InsertConversation,
  type ApiKey,
  type InsertApiKey,
  type PromptTemplate,
  type InsertPromptTemplate
} from "@shared/schema";
import { randomUUID } from "crypto";

import { db } from "./db";
import {
  users,
  projects,
  marketplaceItems,
  conversations,
  collaborations,
  analyticsEvents,
  deployments,
  ratings,
  apiKeys,
  promptTemplates
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
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

  // Collaboration Methods
  addCollaborator(data: any): Promise<any | undefined>;
  getProjectCollaborators(projectId: string): Promise<any[]>;
  removeCollaborator(id: string): Promise<boolean>;

  // Analytics Methods
  trackEvent(data: any): Promise<any | undefined>;
  getUserAnalytics(userId: string): Promise<any[]>;
  getProjectAnalytics(projectId: string): Promise<any[]>;

  // Deployment Methods
  createDeployment(data: any): Promise<any | undefined>;
  getDeploymentsByProject(projectId: string): Promise<any[]>;
  updateDeploymentStatus(id: string, status: string, url?: string, buildLog?: string): Promise<any | undefined>;

  // Rating Methods
  addRating(data: any): Promise<any | undefined>;
  getItemRatings(marketplaceItemId: string): Promise<any[]>;
  getUserRating(marketplaceItemId: string, userId: string): Promise<any | undefined>;

  // API Keys Methods
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getUserApiKeyByProvider(userId: string, provider: string): Promise<ApiKey | undefined>;
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  deleteApiKey(id: string): Promise<boolean>;

  // Prompt Templates Methods
  getPromptTemplate(id: string): Promise<PromptTemplate | undefined>;
  getUserPromptTemplates(userId: string): Promise<PromptTemplate[]>;
  getPublicPromptTemplates(): Promise<PromptTemplate[]>;
  createPromptTemplate(data: InsertPromptTemplate): Promise<PromptTemplate>;
  updatePromptTemplate(id: string, updates: Partial<InsertPromptTemplate>): Promise<PromptTemplate | undefined>;
  deletePromptTemplate(id: string): Promise<boolean>;
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

  // Users (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const now = new Date();
    const user: User = {
      ...existing,
      ...userData,
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      subscriptionTier: existing?.subscriptionTier || "free_forever",
      stripeCustomerId: existing?.stripeCustomerId || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
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

  // Collaboration Methods
  async addCollaborator(data: any) {
    const [collaboration] = await this.db
      .insert(collaborations)
      .values(data)
      .returning();
    return collaboration;
  }

  async getProjectCollaborators(projectId: string) {
    return this.db
      .select()
      .from(collaborations)
      .where(eq(collaborations.projectId, projectId));
  }

  async removeCollaborator(id: string) {
    await this.db.delete(collaborations).where(eq(collaborations.id, id));
    return true;
  }

  // Analytics Methods
  async trackEvent(data: any) {
    const [event] = await this.db
      .insert(analyticsEvents)
      .values(data)
      .returning();
    return event;
  }

  async getUserAnalytics(userId: string) {
    return this.db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.userId, userId))
      .orderBy(analyticsEvents.timestamp);
  }

  async getProjectAnalytics(projectId: string) {
    return this.db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.projectId, projectId))
      .orderBy(analyticsEvents.timestamp);
  }

  // Deployment Methods
  async createDeployment(data: any) {
    const [deployment] = await this.db
      .insert(deployments)
      .values(data)
      .returning();
    return deployment;
  }

  async getDeploymentsByProject(projectId: string) {
    return this.db
      .select()
      .from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(deployments.createdAt);
  }

  async updateDeploymentStatus(id: string, status: string, url?: string, buildLog?: string) {
    const [deployment] = await this.db
      .update(deployments)
      .set({ status, url, buildLog, updatedAt: new Date() })
      .where(eq(deployments.id, id))
      .returning();
    return deployment;
  }

  // Rating Methods
  async addRating(data: any) {
    const [rating] = await this.db
      .insert(ratings)
      .values(data)
      .returning();
    return rating;
  }

  async getItemRatings(marketplaceItemId: string) {
    return this.db
      .select()
      .from(ratings)
      .where(eq(ratings.marketplaceItemId, marketplaceItemId));
  }

  async getUserRating(marketplaceItemId: string, userId: string) {
    const [rating] = await this.db
      .select()
      .from(ratings)
      .where(
        sql`${ratings.marketplaceItemId} = ${marketplaceItemId} AND ${ratings.userId} = ${userId}`
      );
    return rating;
  }

  // API Keys Methods
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [key] = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    return key;
  }

  async getUserApiKeyByProvider(userId: string, provider: string): Promise<ApiKey | undefined> {
    const [key] = await this.db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.provider, provider),
        eq(apiKeys.isActive, true)
      ));
    return key;
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [key] = await this.db
      .insert(apiKeys)
      .values(data)
      .returning();
    return key;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async deleteApiKey(id: string): Promise<boolean> {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
    return true;
  }

  // Prompt Templates Methods
  async getPromptTemplate(id: string): Promise<PromptTemplate | undefined> {
    const [template] = await this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, id));
    return template;
  }

  async getUserPromptTemplates(userId: string): Promise<PromptTemplate[]> {
    return this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.userId, userId))
      .orderBy(promptTemplates.createdAt);
  }

  async getPublicPromptTemplates(): Promise<PromptTemplate[]> {
    return this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.isPublic, true))
      .orderBy(promptTemplates.createdAt);
  }

  async createPromptTemplate(data: InsertPromptTemplate): Promise<PromptTemplate> {
    const [template] = await this.db
      .insert(promptTemplates)
      .values(data)
      .returning();
    return template;
  }

  async updatePromptTemplate(id: string, updates: Partial<InsertPromptTemplate>): Promise<PromptTemplate | undefined> {
    const [template] = await this.db
      .update(promptTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id))
      .returning();
    return template;
  }

  async deletePromptTemplate(id: string): Promise<boolean> {
    await this.db.delete(promptTemplates).where(eq(promptTemplates.id, id));
    return true;
  }
}

export const storage = new MemStorage();