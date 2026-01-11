import { eq, and, sql, desc, ilike } from "drizzle-orm";
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
  whitelistedNumbers,
  whitelistedEmails,
  passwordResetTokens,
  systemSettings,
  videoCategories,
  videos,
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
  type WhitelistedNumber,
  type InsertWhitelistedNumber,
  type WhitelistedEmail,
  type InsertWhitelistedEmail,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type SystemSetting,
  type VideoCategory,
  type InsertVideoCategory,
  type Video,
  type InsertVideo,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getSubscribers(): Promise<User[]>;
  getActiveTrials(): Promise<User[]>;

  // Phone Numbers
  getPhoneNumbersByUser(userId: string): Promise<PhoneNumber[]>;
  getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined>;
  createPhoneNumber(data: InsertPhoneNumber): Promise<PhoneNumber>;
  deletePhoneNumber(id: string): Promise<void>;
  updatePhoneNumber(id: string, phoneNumber: string): Promise<PhoneNumber>;
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
    const [user] = await db.select().from(users).where(ilike(users.email, email));
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
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

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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

  async updatePhoneNumber(id: string, newPhoneNumber: string): Promise<PhoneNumber> {
    const [phone] = await db.update(phoneNumbers).set({ phoneNumber: newPhoneNumber }).where(eq(phoneNumbers.id, id)).returning();
    return phone;
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

  async getMenuOptionsByParent(parentMenuId: string | null): Promise<MenuOption[]> {
    if (parentMenuId === null) {
      return db.select().from(menuOptions)
        .where(sql`${menuOptions.parentMenuId} IS NULL`)
        .orderBy(menuOptions.optionNumber);
    }
    return db.select().from(menuOptions)
      .where(eq(menuOptions.parentMenuId, parentMenuId))
      .orderBy(menuOptions.optionNumber);
  }

  async getMenuOption(id: string): Promise<MenuOption | undefined> {
    const [option] = await db.select().from(menuOptions).where(eq(menuOptions.id, id));
    return option;
  }

  async getMenuOptionByNumberAndParent(optionNumber: number, parentMenuId: string | null): Promise<MenuOption | undefined> {
    if (parentMenuId === null) {
      const [option] = await db.select().from(menuOptions)
        .where(and(
          eq(menuOptions.optionNumber, optionNumber),
          sql`${menuOptions.parentMenuId} IS NULL`
        ));
      return option;
    }
    const [option] = await db.select().from(menuOptions)
      .where(and(
        eq(menuOptions.optionNumber, optionNumber),
        eq(menuOptions.parentMenuId, parentMenuId)
      ));
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

  async upsertMenuOption(optionNumber: number, parentMenuId: string | null, data: Partial<InsertMenuOption>): Promise<MenuOption> {
    const existing = await this.getMenuOptionByNumberAndParent(optionNumber, parentMenuId);
    if (existing) {
      const [option] = await db.update(menuOptions).set(data).where(eq(menuOptions.id, existing.id)).returning();
      return option;
    } else {
      const [option] = await db.insert(menuOptions).values({
        optionNumber,
        parentMenuId,
        ...data,
      } as InsertMenuOption).returning();
      return option;
    }
  }

  async shiftMenuOptionsDown(parentMenuId: string | null): Promise<void> {
    await db.transaction(async (tx) => {
      if (parentMenuId === null) {
        await tx.execute(sql`
          UPDATE menu_options 
          SET option_number = option_number + 10000 
          WHERE parent_menu_id IS NULL
        `);
        await tx.execute(sql`
          UPDATE menu_options 
          SET option_number = option_number - 9999 
          WHERE parent_menu_id IS NULL AND option_number >= 10000
        `);
      } else {
        await tx.execute(sql`
          UPDATE menu_options 
          SET option_number = option_number + 10000 
          WHERE parent_menu_id = ${parentMenuId}
        `);
        await tx.execute(sql`
          UPDATE menu_options 
          SET option_number = option_number - 9999 
          WHERE parent_menu_id = ${parentMenuId} AND option_number >= 10000
        `);
      }
    });
  }

  async getHighestOptionNumber(parentMenuId: string | null): Promise<number> {
    const options = await this.getMenuOptionsByParent(parentMenuId);
    if (options.length === 0) return 0;
    return Math.max(...options.map(o => o.optionNumber));
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

  // Whitelisted Numbers
  async getAllWhitelistedNumbers(): Promise<WhitelistedNumber[]> {
    return db.select().from(whitelistedNumbers).orderBy(desc(whitelistedNumbers.createdAt));
  }

  async getWhitelistedNumber(phoneNumber: string): Promise<WhitelistedNumber | undefined> {
    const [num] = await db.select().from(whitelistedNumbers).where(eq(whitelistedNumbers.phoneNumber, phoneNumber));
    return num;
  }

  async createWhitelistedNumber(data: InsertWhitelistedNumber): Promise<WhitelistedNumber> {
    const [num] = await db.insert(whitelistedNumbers).values(data).returning();
    return num;
  }

  async deleteWhitelistedNumber(id: string): Promise<void> {
    await db.delete(whitelistedNumbers).where(eq(whitelistedNumbers.id, id));
  }

  async isWhitelistedPhoneNumber(phoneNumber: string): Promise<boolean> {
    const num = await this.getWhitelistedNumber(phoneNumber);
    return !!num;
  }

  // Whitelisted Emails (for free video access)
  async getAllWhitelistedEmails(): Promise<WhitelistedEmail[]> {
    return db.select().from(whitelistedEmails).orderBy(desc(whitelistedEmails.createdAt));
  }

  async getWhitelistedEmail(email: string): Promise<WhitelistedEmail | undefined> {
    const [entry] = await db.select().from(whitelistedEmails).where(ilike(whitelistedEmails.email, email));
    return entry;
  }

  async createWhitelistedEmail(data: InsertWhitelistedEmail): Promise<WhitelistedEmail> {
    const [entry] = await db.insert(whitelistedEmails).values(data).returning();
    return entry;
  }

  async deleteWhitelistedEmail(id: string): Promise<void> {
    await db.delete(whitelistedEmails).where(eq(whitelistedEmails.id, id));
  }

  async isWhitelistedEmailAddress(email: string): Promise<boolean> {
    const entry = await this.getWhitelistedEmail(email);
    return !!entry;
  }

  // Monthly call stats per subscriber
  async getMonthlyCallStats(year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    const result = await db.execute(sql`
      SELECT 
        u.id as user_id,
        u.email,
        pn.phone_number,
        COALESCE(SUM(cl.duration), 0) as total_duration,
        COUNT(cl.id) as total_calls
      FROM users u
      LEFT JOIN phone_numbers pn ON pn.user_id = u.id
      LEFT JOIN call_logs cl ON cl.from_number = pn.phone_number 
        AND cl.created_at >= ${startDate.toISOString()} 
        AND cl.created_at < ${endDate.toISOString()}
      WHERE u.role = 'customer'
        AND u.subscription_status IN ('active', 'trial')
      GROUP BY u.id, u.email, pn.phone_number
      ORDER BY total_duration DESC
    `);
    
    return result.rows;
  }

  // Get all subscribers with their phone numbers and call stats
  async getSubscriberList(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.subscription_status,
        u.stripe_customer_id,
        u.stripe_subscription_id,
        u.trial_ends_at,
        u.created_at,
        pn.phone_number
      FROM users u
      LEFT JOIN phone_numbers pn ON pn.user_id = u.id
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `);
    return result.rows;
  }

  // Password Reset Tokens
  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(data).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [result] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens).where(sql`${passwordResetTokens.expiresAt} < NOW()`);
  }

  // System Settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [result] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return result;
  }

  async setSystemSetting(key: string, value?: string, audioFileId?: string): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    if (existing) {
      const [updated] = await db.update(systemSettings)
        .set({ value, audioFileId, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(systemSettings)
      .values({ key, value, audioFileId })
      .returning();
    return created;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return db.select().from(systemSettings);
  }

  // Videos
  async getAllVideos(): Promise<Video[]> {
    return db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getPublishedVideos(): Promise<Video[]> {
    return db.select().from(videos)
      .where(eq(videos.status, "ready"))
      .orderBy(desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(data).returning();
    return video;
  }

  async updateVideo(id: string, data: Partial<Video>): Promise<Video | undefined> {
    const [video] = await db.update(videos).set(data).where(eq(videos.id, id)).returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async incrementVideoViewCount(id: string): Promise<void> {
    await db.update(videos)
      .set({ viewCount: sql<number>`COALESCE(view_count, 0) + 1` })
      .where(eq(videos.id, id));
  }

  // Video Categories
  async getAllVideoCategories(): Promise<VideoCategory[]> {
    return db.select().from(videoCategories).orderBy(videoCategories.sortOrder);
  }

  async getVideoCategory(id: string): Promise<VideoCategory | undefined> {
    const [category] = await db.select().from(videoCategories).where(eq(videoCategories.id, id));
    return category;
  }

  async getVideoCategoryByName(name: string): Promise<VideoCategory | undefined> {
    const [category] = await db.select().from(videoCategories).where(eq(videoCategories.name, name));
    return category;
  }

  async createVideoCategory(data: InsertVideoCategory): Promise<VideoCategory> {
    const [category] = await db.insert(videoCategories).values(data).returning();
    return category;
  }

  async updateVideoCategory(id: string, data: Partial<VideoCategory>): Promise<VideoCategory | undefined> {
    const [category] = await db.update(videoCategories).set(data).where(eq(videoCategories.id, id)).returning();
    return category;
  }

  async deleteVideoCategory(id: string): Promise<void> {
    await db.delete(videoCategories).where(eq(videoCategories.id, id));
  }
}

export const storage = new DatabaseStorage();
