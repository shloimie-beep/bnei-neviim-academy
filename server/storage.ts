import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  phoneNumbers,
  audioFiles,
  menuOptions,
  conferenceSessions,
  conferenceParticipants,
  unmuteRequests,
  callLogs,
  type User,
  type InsertUser,
  type PhoneNumber,
  type InsertPhoneNumber,
  type AudioFile,
  type InsertAudioFile,
  type MenuOption,
  type InsertMenuOption,
  type ConferenceSession,
  type InsertConferenceSession,
  type ConferenceParticipant,
  type InsertConferenceParticipant,
  type UnmuteRequest,
  type InsertUnmuteRequest,
  type CallLog,
  type InsertCallLog,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getSubscribers(): Promise<User[]>;
  getActiveTrials(): Promise<User[]>;

  // Phone Numbers
  getPhoneNumbersByUser(userId: string): Promise<PhoneNumber[]>;
  getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined>;
  createPhoneNumber(data: InsertPhoneNumber): Promise<PhoneNumber>;
  deletePhoneNumber(id: string): Promise<void>;
  isSubscribedPhoneNumber(phoneNumber: string): Promise<boolean>;

  // Audio Files
  getAllAudioFiles(): Promise<AudioFile[]>;
  getAudioFile(id: string): Promise<AudioFile | undefined>;
  getAudioFilesByType(type: string): Promise<AudioFile[]>;
  createAudioFile(data: InsertAudioFile): Promise<AudioFile>;
  deleteAudioFile(id: string): Promise<void>;

  // Menu Options
  getAllMenuOptions(): Promise<MenuOption[]>;
  getMenuOption(id: string): Promise<MenuOption | undefined>;
  getMenuOptionByNumber(optionNumber: number): Promise<MenuOption | undefined>;
  createMenuOption(data: InsertMenuOption): Promise<MenuOption>;
  updateMenuOption(id: string, data: Partial<MenuOption>): Promise<MenuOption | undefined>;
  deleteMenuOption(id: string): Promise<void>;

  // Conference Sessions
  getActiveConference(): Promise<ConferenceSession | undefined>;
  createConferenceSession(data: InsertConferenceSession): Promise<ConferenceSession>;
  endConferenceSession(id: string): Promise<void>;

  // Conference Participants
  getConferenceParticipants(sessionId: string): Promise<ConferenceParticipant[]>;
  getParticipantByCallUuid(callUuid: string): Promise<ConferenceParticipant | undefined>;
  addParticipant(data: InsertConferenceParticipant): Promise<ConferenceParticipant>;
  updateParticipant(id: string, data: Partial<ConferenceParticipant>): Promise<ConferenceParticipant | undefined>;
  removeParticipant(id: string): Promise<void>;

  // Unmute Requests
  getUnmuteRequests(sessionId: string): Promise<UnmuteRequest[]>;
  getPendingUnmuteRequests(sessionId: string): Promise<UnmuteRequest[]>;
  createUnmuteRequest(data: InsertUnmuteRequest): Promise<UnmuteRequest>;
  resolveUnmuteRequest(id: string, status: string): Promise<UnmuteRequest | undefined>;

  // Call Logs
  createCallLog(data: InsertCallLog): Promise<CallLog>;

  // Stats
  getStats(): Promise<{
    totalSubscribers: number;
    activeTrials: number;
    totalAudioFiles: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getSubscribers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.subscriptionStatus, "active"));
  }

  async getActiveTrials(): Promise<User[]> {
    return db.select().from(users).where(eq(users.subscriptionStatus, "trial"));
  }

  // Phone Numbers
  async getPhoneNumbersByUser(userId: string): Promise<PhoneNumber[]> {
    return db.select().from(phoneNumbers).where(eq(phoneNumbers.userId, userId));
  }

  async getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined> {
    const [phone] = await db.select().from(phoneNumbers).where(eq(phoneNumbers.phoneNumber, phoneNumber));
    return phone;
  }

  async createPhoneNumber(data: InsertPhoneNumber): Promise<PhoneNumber> {
    const [phone] = await db.insert(phoneNumbers).values(data).returning();
    return phone;
  }

  async deletePhoneNumber(id: string): Promise<void> {
    await db.delete(phoneNumbers).where(eq(phoneNumbers.id, id));
  }

  async isSubscribedPhoneNumber(phoneNumber: string): Promise<boolean> {
    const phone = await this.getPhoneNumberByNumber(phoneNumber);
    if (!phone) return false;
    
    const user = await this.getUser(phone.userId);
    if (!user) return false;
    
    // Check if subscription is active or trial is still valid
    if (user.subscriptionStatus === "active") return true;
    if (user.subscriptionStatus === "trial" && user.trialEndsAt) {
      return new Date(user.trialEndsAt) > new Date();
    }
    return false;
  }

  // Audio Files
  async getAllAudioFiles(): Promise<AudioFile[]> {
    return db.select().from(audioFiles).orderBy(desc(audioFiles.createdAt));
  }

  async getAudioFile(id: string): Promise<AudioFile | undefined> {
    const [file] = await db.select().from(audioFiles).where(eq(audioFiles.id, id));
    return file;
  }

  async getAudioFilesByType(type: string): Promise<AudioFile[]> {
    return db.select().from(audioFiles).where(eq(audioFiles.type, type));
  }

  async createAudioFile(data: InsertAudioFile): Promise<AudioFile> {
    const [file] = await db.insert(audioFiles).values(data).returning();
    return file;
  }

  async deleteAudioFile(id: string): Promise<void> {
    await db.delete(audioFiles).where(eq(audioFiles.id, id));
  }

  // Menu Options
  async getAllMenuOptions(): Promise<MenuOption[]> {
    return db.select().from(menuOptions).orderBy(menuOptions.optionNumber);
  }

  async getMenuOption(id: string): Promise<MenuOption | undefined> {
    const [option] = await db.select().from(menuOptions).where(eq(menuOptions.id, id));
    return option;
  }

  async getMenuOptionByNumber(optionNumber: number): Promise<MenuOption | undefined> {
    const [option] = await db.select().from(menuOptions).where(eq(menuOptions.optionNumber, optionNumber));
    return option;
  }

  async createMenuOption(data: InsertMenuOption): Promise<MenuOption> {
    const [option] = await db.insert(menuOptions).values(data).returning();
    return option;
  }

  async updateMenuOption(id: string, data: Partial<MenuOption>): Promise<MenuOption | undefined> {
    const [option] = await db.update(menuOptions).set(data).where(eq(menuOptions.id, id)).returning();
    return option;
  }

  async deleteMenuOption(id: string): Promise<void> {
    await db.delete(menuOptions).where(eq(menuOptions.id, id));
  }

  // Conference Sessions
  async getActiveConference(): Promise<ConferenceSession | undefined> {
    const [session] = await db.select().from(conferenceSessions).where(eq(conferenceSessions.isActive, true));
    return session;
  }

  async createConferenceSession(data: InsertConferenceSession): Promise<ConferenceSession> {
    const [session] = await db.insert(conferenceSessions).values(data).returning();
    return session;
  }

  async endConferenceSession(id: string): Promise<void> {
    await db.update(conferenceSessions)
      .set({ isActive: false, endedAt: new Date() })
      .where(eq(conferenceSessions.id, id));
  }

  // Conference Participants
  async getConferenceParticipants(sessionId: string): Promise<ConferenceParticipant[]> {
    return db.select().from(conferenceParticipants)
      .where(and(
        eq(conferenceParticipants.sessionId, sessionId),
        sql`${conferenceParticipants.leftAt} IS NULL`
      ));
  }

  async getParticipantByCallUuid(callUuid: string): Promise<ConferenceParticipant | undefined> {
    const [participant] = await db.select().from(conferenceParticipants)
      .where(eq(conferenceParticipants.callUuid, callUuid));
    return participant;
  }

  async addParticipant(data: InsertConferenceParticipant): Promise<ConferenceParticipant> {
    const [participant] = await db.insert(conferenceParticipants).values(data).returning();
    return participant;
  }

  async updateParticipant(id: string, data: Partial<ConferenceParticipant>): Promise<ConferenceParticipant | undefined> {
    const [participant] = await db.update(conferenceParticipants)
      .set(data)
      .where(eq(conferenceParticipants.id, id))
      .returning();
    return participant;
  }

  async removeParticipant(id: string): Promise<void> {
    await db.update(conferenceParticipants)
      .set({ leftAt: new Date() })
      .where(eq(conferenceParticipants.id, id));
  }

  // Unmute Requests
  async getUnmuteRequests(sessionId: string): Promise<UnmuteRequest[]> {
    return db.select().from(unmuteRequests)
      .where(eq(unmuteRequests.sessionId, sessionId))
      .orderBy(desc(unmuteRequests.requestedAt));
  }

  async getPendingUnmuteRequests(sessionId: string): Promise<UnmuteRequest[]> {
    return db.select().from(unmuteRequests)
      .where(and(
        eq(unmuteRequests.sessionId, sessionId),
        eq(unmuteRequests.status, "pending")
      ))
      .orderBy(unmuteRequests.requestedAt);
  }

  async createUnmuteRequest(data: InsertUnmuteRequest): Promise<UnmuteRequest> {
    const [request] = await db.insert(unmuteRequests).values(data).returning();
    return request;
  }

  async resolveUnmuteRequest(id: string, status: string): Promise<UnmuteRequest | undefined> {
    const [request] = await db.update(unmuteRequests)
      .set({ status, resolvedAt: new Date() })
      .where(eq(unmuteRequests.id, id))
      .returning();
    return request;
  }

  // Call Logs
  async createCallLog(data: InsertCallLog): Promise<CallLog> {
    const [log] = await db.insert(callLogs).values(data).returning();
    return log;
  }

  // Stats
  async getStats(): Promise<{
    totalSubscribers: number;
    activeTrials: number;
    totalAudioFiles: number;
  }> {
    const [subscriberResult] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));
    
    const [trialResult] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.subscriptionStatus, "trial"));
    
    const [audioResult] = await db.select({ count: sql<number>`count(*)` })
      .from(audioFiles);

    return {
      totalSubscribers: Number(subscriberResult?.count || 0),
      activeTrials: Number(trialResult?.count || 0),
      totalAudioFiles: Number(audioResult?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
