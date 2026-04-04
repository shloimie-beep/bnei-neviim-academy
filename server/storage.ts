import { eq, and, sql, desc, ilike, gte, inArray } from "drizzle-orm";
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
  documents,
  userVideoViews,
  albums,
  albumTracks,
  rssFolders,
  rssAudioItems,
  userDashboardSessions,
  siteAnnouncement,
  liveMeeting,
  featuredVideos,
  videoComments,
  dashboardBanners,
  type VideoComment,
  type InsertVideoComment,
  type DashboardBanner,
  type InsertDashboardBanner,
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
  type Document,
  type InsertDocument,
  type UserVideoView,
  trialPhoneNumbers,
  type TrialPhoneNumber,
  type Album,
  type InsertAlbum,
  type AlbumTrack,
  type InsertAlbumTrack,
  type RssFolder,
  type InsertRssFolder,
  type RssAudioItem,
  type InsertRssAudioItem,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getSubscribers(): Promise<User[]>;
  getActiveTrials(): Promise<User[]>;

  // Phone Numbers
  getPhoneNumbersByUser(userId: string): Promise<PhoneNumber[]>;
  getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined>;
  createPhoneNumber(data: InsertPhoneNumber): Promise<PhoneNumber>;
  deletePhoneNumber(id: string): Promise<void>;
  updatePhoneNumber(id: string, phoneNumber: string): Promise<PhoneNumber>;
  isSubscribedPhoneNumber(phoneNumber: string): Promise<boolean>;

  // Dashboard Sessions
  recordDashboardSession(userId: string): Promise<void>;
  getDashboardSessionCount(userId: string, since: Date): Promise<number>;
  // Featured Videos (public homepage)
  getFeaturedVideos(): Promise<{ id: number; title: string; description: string; vimeoEmbedUrl: string; displayOrder: number }[]>;
  addFeaturedVideo(title: string, description: string, vimeoEmbedUrl: string): Promise<{ id: number }>;
  updateFeaturedVideo(id: number, title: string, description: string, vimeoEmbedUrl: string): Promise<void>;
  deleteFeaturedVideo(id: number): Promise<void>;
  reorderFeaturedVideos(ids: number[]): Promise<void>;

  getAnnouncement(): Promise<{ text: string; isActive: boolean; imageUrl: string | null; webhookSecret: string } | null>;
  setAnnouncement(text: string, isActive: boolean, imageUrl?: string | null): Promise<void>;
  getLiveMeeting(): Promise<{ meetingUrl: string; isActive: boolean; updatesText: string } | null>;
  setLiveMeeting(meetingUrl: string, isActive: boolean, updatesText: string): Promise<void>;

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

  // Trending
  getTrendingVideos(limit?: number): Promise<Video[]>;

  // Video Comments
  getVideoComments(videoId: string): Promise<(VideoComment & { userEmail: string; familyName: string | null })[]>;
  getAllVideoComments(): Promise<(VideoComment & { userEmail: string; familyName: string | null; videoTitle: string })[]>;
  createVideoComment(data: InsertVideoComment): Promise<VideoComment>;
  deleteVideoComment(id: string): Promise<void>;

  // Dashboard Banners
  getBanners(activeOnly?: boolean): Promise<DashboardBanner[]>;
  getBannerById(id: string): Promise<DashboardBanner | undefined>;
  createBanner(data: InsertDashboardBanner): Promise<DashboardBanner>;
  updateBanner(id: string, data: Partial<InsertDashboardBanner>): Promise<DashboardBanner>;
  deleteBanner(id: string): Promise<void>;
  reorderBanners(ids: string[]): Promise<void>;
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
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

  // Dashboard Sessions
  async recordDashboardSession(userId: string): Promise<void> {
    await db.insert(userDashboardSessions).values({ userId });
  }

  async getDashboardSessionCount(userId: string, since: Date): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM user_dashboard_sessions
      WHERE user_id = ${userId} AND created_at >= ${since.toISOString()}
    `);
    return Number((result.rows[0] as any)?.count || 0);
  }

  async getFeaturedVideos(): Promise<{ id: number; title: string; description: string; vimeoEmbedUrl: string; displayOrder: number }[]> {
    return db.select({
      id: featuredVideos.id,
      title: featuredVideos.title,
      description: featuredVideos.description,
      vimeoEmbedUrl: featuredVideos.vimeoEmbedUrl,
      displayOrder: featuredVideos.displayOrder,
    }).from(featuredVideos).orderBy(featuredVideos.displayOrder, featuredVideos.id);
  }

  async addFeaturedVideo(title: string, description: string, vimeoEmbedUrl: string): Promise<{ id: number }> {
    const maxOrder = await db.select({ val: featuredVideos.displayOrder }).from(featuredVideos).orderBy(sql`display_order desc`).limit(1);
    const nextOrder = maxOrder.length > 0 ? (maxOrder[0].val ?? 0) + 1 : 0;
    const [row] = await db.insert(featuredVideos).values({ title, description, vimeoEmbedUrl, displayOrder: nextOrder }).returning({ id: featuredVideos.id });
    return { id: row.id };
  }

  async updateFeaturedVideo(id: number, title: string, description: string, vimeoEmbedUrl: string): Promise<void> {
    await db.update(featuredVideos).set({ title, description, vimeoEmbedUrl }).where(eq(featuredVideos.id, id));
  }

  async deleteFeaturedVideo(id: number): Promise<void> {
    await db.delete(featuredVideos).where(eq(featuredVideos.id, id));
  }

  async reorderFeaturedVideos(ids: number[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await db.update(featuredVideos).set({ displayOrder: i }).where(eq(featuredVideos.id, ids[i]));
    }
  }

  async getAnnouncement(): Promise<{ text: string; isActive: boolean; imageUrl: string | null; webhookSecret: string } | null> {
    const rows = await db.select().from(siteAnnouncement).where(eq(siteAnnouncement.id, 1));
    if (rows.length === 0) return null;
    return { text: rows[0].text, isActive: rows[0].isActive, imageUrl: rows[0].imageUrl ?? null, webhookSecret: rows[0].webhookSecret };
  }

  async setAnnouncement(text: string, isActive: boolean, imageUrl?: string | null): Promise<void> {
    await db.insert(siteAnnouncement)
      .values({ id: 1, text, isActive, imageUrl: imageUrl !== undefined ? imageUrl : null })
      .onConflictDoUpdate({
        target: siteAnnouncement.id,
        set: {
          text,
          isActive,
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          updatedAt: new Date(),
        },
      });
  }

  async getLiveMeeting(): Promise<{ meetingUrl: string; isActive: boolean; updatesText: string } | null> {
    const rows = await db.select().from(liveMeeting).where(eq(liveMeeting.id, 1));
    if (rows.length === 0) return null;
    return { meetingUrl: rows[0].meetingUrl ?? "", isActive: rows[0].isActive, updatesText: rows[0].updatesText };
  }

  async setLiveMeeting(meetingUrl: string, isActive: boolean, updatesText: string): Promise<void> {
    await db.insert(liveMeeting)
      .values({ id: 1, meetingUrl, isActive, updatesText })
      .onConflictDoUpdate({
        target: liveMeeting.id,
        set: { meetingUrl, isActive, updatesText, updatedAt: new Date() },
      });
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
    if (!num) return false;
    if (num.expiresAt && new Date(num.expiresAt) < new Date()) return false;
    return true;
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
    if (!entry) return false;
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return false;
    return true;
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.family_name,
        u.location,
        u.account_type,
        u.subscription_status,
        u.stripe_customer_id,
        u.stripe_subscription_id,
        u.trial_ends_at,
        u.created_at,
        COALESCE(
          (SELECT array_agg(phone_number) FROM phone_numbers WHERE user_id = u.id),
          ARRAY[]::text[]
        ) as phone_numbers,
        COALESCE(
          (SELECT COUNT(*) FROM user_dashboard_sessions uds
           WHERE uds.user_id = u.id
             AND uds.created_at >= ${startOfMonth.toISOString()}),
          0
        ) as monthly_sessions
      FROM users u
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      familyName: row.family_name,
      location: row.location,
      accountType: row.account_type,
      subscriptionStatus: row.subscription_status,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      trialEndsAt: row.trial_ends_at,
      createdAt: row.created_at,
      phoneNumbers: (row.phone_numbers || []).map((p: string) => ({ phoneNumber: p })),
      monthlySessions: Number(row.monthly_sessions || 0),
    }));
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

  // Videos - sorted by sortOrder ASC (lower = higher priority), then createdAt DESC (newest first)
  async getAllVideos(): Promise<Video[]> {
    return db.select().from(videos).orderBy(videos.sortOrder, desc(videos.createdAt));
  }

  async getPublishedVideos(): Promise<Video[]> {
    return db.select().from(videos)
      .where(eq(videos.status, "ready"))
      .orderBy(videos.sortOrder, desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(data).returning();
    // Auto-create a banner slide for this new video
    try {
      const existing = await db.select().from(dashboardBanners);
      await db.insert(dashboardBanners).values({
        title: `New: ${video.title}`,
        subtitle: "Just added — check it out!",
        imageUrl: video.thumbnailPath || null,
        videoId: video.id,
        isActive: true,
        isAutoGenerated: true,
        displayOrder: existing.length,
      });
    } catch (err) {
      console.error("Failed to auto-create banner:", err);
    }
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
    // First, nullify categoryId for all videos in this category
    await db.update(videos).set({ categoryId: null }).where(eq(videos.categoryId, id));
    await db.update(documents).set({ categoryId: null }).where(eq(documents.categoryId, id));
    await db.update(albums).set({ categoryId: null }).where(eq(albums.categoryId, id));
    
    // Find and delete subcategories (and nullify their videos first)
    const subcategories = await db.select().from(videoCategories).where(eq(videoCategories.parentCategoryId, id));
    for (const sub of subcategories) {
      await db.update(videos).set({ categoryId: null }).where(eq(videos.categoryId, sub.id));
      await db.update(documents).set({ categoryId: null }).where(eq(documents.categoryId, sub.id));
      await db.update(albums).set({ categoryId: null }).where(eq(albums.categoryId, sub.id));
      await db.delete(videoCategories).where(eq(videoCategories.id, sub.id));
    }
    
    // Finally delete the category
    await db.delete(videoCategories).where(eq(videoCategories.id, id));
  }

  // Documents
  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getPublishedDocuments(): Promise<Document[]> {
    return db.select().from(documents)
      .where(eq(documents.status, "ready"))
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document | undefined> {
    const [doc] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return doc;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async incrementDocumentViewCount(id: string): Promise<void> {
    await db.update(documents)
      .set({ viewCount: sql<number>`COALESCE(view_count, 0) + 1` })
      .where(eq(documents.id, id));
  }

  // User Video Views (for per-user "New" badge)
  async hasUserViewedVideo(userId: string, videoId: string): Promise<boolean> {
    const [view] = await db.select()
      .from(userVideoViews)
      .where(and(
        eq(userVideoViews.userId, userId),
        eq(userVideoViews.videoId, videoId)
      ));
    return !!view;
  }

  async markVideoAsViewed(userId: string, videoId: string): Promise<UserVideoView | undefined> {
    // Use ON CONFLICT to handle duplicates gracefully
    const [view] = await db.insert(userVideoViews)
      .values({ userId, videoId })
      .onConflictDoNothing()
      .returning();
    return view;
  }

  async getUserViewedVideoIds(userId: string): Promise<string[]> {
    const views = await db.select({ videoId: userVideoViews.videoId })
      .from(userVideoViews)
      .where(eq(userVideoViews.userId, userId));
    return views.map(v => v.videoId);
  }

  async getTrendingVideos(limit: number = 10): Promise<Video[]> {
    // Get videos with most new views in the past 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Count recent views per video
    const recentViews = await db
      .select({
        videoId: userVideoViews.videoId,
        viewCount: sql<number>`count(*)`.as('view_count'),
      })
      .from(userVideoViews)
      .where(gte(userVideoViews.firstViewedAt, fortyEightHoursAgo))
      .groupBy(userVideoViews.videoId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    if (recentViews.length === 0) {
      // Fallback: return most viewed videos overall if no recent views
      return db.select().from(videos)
        .where(eq(videos.status, "ready"))
        .orderBy(desc(videos.viewCount))
        .limit(limit);
    }

    // Get full video data for the trending videos
    const videoIds = recentViews.map(v => v.videoId);
    const trendingVideos = await db.select().from(videos)
      .where(and(
        eq(videos.status, "ready"),
        inArray(videos.id, videoIds)
      ));

    // Sort by the view count order from recentViews
    const videoIdOrder = new Map(recentViews.map((v, i) => [v.videoId, i]));
    return trendingVideos.sort((a, b) => 
      (videoIdOrder.get(a.id) ?? 999) - (videoIdOrder.get(b.id) ?? 999)
    );
  }

  // Trial Phone Numbers - track phones used in trials to prevent reuse
  async isPhoneUsedInTrial(phoneNumber: string): Promise<boolean> {
    const [record] = await db.select()
      .from(trialPhoneNumbers)
      .where(and(
        eq(trialPhoneNumbers.phoneNumber, phoneNumber),
        sql`released_at IS NULL`
      ));
    return !!record;
  }

  async recordTrialPhoneNumber(phoneNumber: string, userId: string): Promise<TrialPhoneNumber> {
    // Use upsert to handle released numbers - clear releasedAt when reusing
    const [record] = await db.insert(trialPhoneNumbers)
      .values({ phoneNumber, userId })
      .onConflictDoUpdate({
        target: trialPhoneNumbers.phoneNumber,
        set: {
          userId,
          usedAt: new Date(),
          releasedAt: null, // Re-lock the phone number
        }
      })
      .returning();
    return record;
  }

  async releaseTrialPhoneNumber(phoneNumber: string): Promise<void> {
    await db.update(trialPhoneNumbers)
      .set({ releasedAt: new Date() })
      .where(eq(trialPhoneNumbers.phoneNumber, phoneNumber));
  }

  async getTrialPhoneNumbers(): Promise<TrialPhoneNumber[]> {
    return db.select().from(trialPhoneNumbers).orderBy(trialPhoneNumbers.usedAt);
  }

  // Albums
  async getAllAlbums(): Promise<Album[]> {
    return db.select().from(albums).orderBy(desc(albums.createdAt));
  }

  async getPublishedAlbums(): Promise<Album[]> {
    return db.select().from(albums)
      .where(eq(albums.status, "ready"))
      .orderBy(desc(albums.createdAt));
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album;
  }

  async createAlbum(data: InsertAlbum): Promise<Album> {
    const [album] = await db.insert(albums).values(data).returning();
    return album;
  }

  async updateAlbum(id: string, data: Partial<Album>): Promise<Album | undefined> {
    const [album] = await db.update(albums).set(data).where(eq(albums.id, id)).returning();
    return album;
  }

  async deleteAlbum(id: string): Promise<void> {
    await db.delete(albums).where(eq(albums.id, id));
  }

  // Album Tracks
  async getAlbumTracks(albumId: string): Promise<AlbumTrack[]> {
    return db.select().from(albumTracks)
      .where(eq(albumTracks.albumId, albumId))
      .orderBy(albumTracks.trackNumber);
  }

  async getAlbumTrack(id: string): Promise<AlbumTrack | undefined> {
    const [track] = await db.select().from(albumTracks).where(eq(albumTracks.id, id));
    return track;
  }

  async createAlbumTrack(data: InsertAlbumTrack): Promise<AlbumTrack> {
    const [track] = await db.insert(albumTracks).values(data).returning();
    return track;
  }

  async updateAlbumTrack(id: string, data: Partial<AlbumTrack>): Promise<AlbumTrack | undefined> {
    const [track] = await db.update(albumTracks).set(data).where(eq(albumTracks.id, id)).returning();
    return track;
  }

  async deleteAlbumTrack(id: string): Promise<void> {
    await db.delete(albumTracks).where(eq(albumTracks.id, id));
  }

  async getNextTrackNumber(albumId: string): Promise<number> {
    const tracks = await this.getAlbumTracks(albumId);
    if (tracks.length === 0) return 1;
    return Math.max(...tracks.map(t => t.trackNumber)) + 1;
  }

  // RSS Folders
  async getAllRssFolders(): Promise<RssFolder[]> {
    return db.select().from(rssFolders).orderBy(rssFolders.sortOrder, rssFolders.createdAt);
  }

  async getRssFolder(id: string): Promise<RssFolder | undefined> {
    const [folder] = await db.select().from(rssFolders).where(eq(rssFolders.id, id));
    return folder;
  }

  async createRssFolder(data: InsertRssFolder): Promise<RssFolder> {
    const [folder] = await db.insert(rssFolders).values(data).returning();
    return folder;
  }

  async updateRssFolder(id: string, data: Partial<RssFolder>): Promise<RssFolder | undefined> {
    const [folder] = await db.update(rssFolders).set(data).where(eq(rssFolders.id, id)).returning();
    return folder;
  }

  async deleteRssFolder(id: string): Promise<void> {
    await db.delete(rssFolders).where(eq(rssFolders.id, id));
  }

  // RSS Audio Items - ordered by sortOrder ASC (lower = higher priority), then createdAt DESC (newest first)
  async getAllRssAudioItems(): Promise<RssAudioItem[]> {
    return db.select().from(rssAudioItems).orderBy(rssAudioItems.sortOrder, desc(rssAudioItems.createdAt));
  }

  async getRssAudioItemsByFolder(folderId: string | null): Promise<RssAudioItem[]> {
    if (folderId === null) {
      return db.select().from(rssAudioItems)
        .where(sql`${rssAudioItems.folderId} IS NULL`)
        .orderBy(rssAudioItems.sortOrder, desc(rssAudioItems.createdAt));
    }
    return db.select().from(rssAudioItems)
      .where(eq(rssAudioItems.folderId, folderId))
      .orderBy(rssAudioItems.sortOrder, desc(rssAudioItems.createdAt));
  }

  async getRssAudioItemsByFolderForDeletion(folderId: string): Promise<RssAudioItem[]> {
    return db.select().from(rssAudioItems).where(eq(rssAudioItems.folderId, folderId));
  }

  async getRssAudioItem(id: string): Promise<RssAudioItem | undefined> {
    const [item] = await db.select().from(rssAudioItems).where(eq(rssAudioItems.id, id));
    return item;
  }

  async createRssAudioItem(data: InsertRssAudioItem): Promise<RssAudioItem> {
    const [item] = await db.insert(rssAudioItems).values(data).returning();
    return item;
  }

  async updateRssAudioItem(id: string, data: Partial<RssAudioItem>): Promise<RssAudioItem | undefined> {
    const [item] = await db.update(rssAudioItems).set(data).where(eq(rssAudioItems.id, id)).returning();
    return item;
  }

  async deleteRssAudioItem(id: string): Promise<void> {
    await db.delete(rssAudioItems).where(eq(rssAudioItems.id, id));
  }

  async getNextRssAudioSortOrder(folderId: string | null): Promise<number> {
    const items = await this.getRssAudioItemsByFolder(folderId);
    if (items.length === 0) return 0;
    return Math.max(...items.map(i => i.sortOrder || 0)) + 1;
  }

  // Video Comments
  async getVideoComments(videoId: string): Promise<(VideoComment & { userEmail: string; familyName: string | null })[]> {
    const rows = await db
      .select({
        id: videoComments.id,
        videoId: videoComments.videoId,
        userId: videoComments.userId,
        text: videoComments.text,
        parentId: videoComments.parentId,
        isAdminReply: videoComments.isAdminReply,
        createdAt: videoComments.createdAt,
        userEmail: users.email,
        familyName: users.familyName,
      })
      .from(videoComments)
      .innerJoin(users, eq(videoComments.userId, users.id))
      .where(eq(videoComments.videoId, videoId))
      .orderBy(videoComments.createdAt);
    return rows;
  }

  async createVideoComment(data: InsertVideoComment): Promise<VideoComment> {
    const [comment] = await db.insert(videoComments).values(data).returning();
    return comment;
  }

  async deleteVideoComment(id: string): Promise<void> {
    await db.delete(videoComments).where(eq(videoComments.id, id));
  }

  async getAllVideoComments(): Promise<(VideoComment & { userEmail: string; familyName: string | null; videoTitle: string })[]> {
    const rows = await db
      .select({
        id: videoComments.id,
        videoId: videoComments.videoId,
        userId: videoComments.userId,
        text: videoComments.text,
        parentId: videoComments.parentId,
        isAdminReply: videoComments.isAdminReply,
        createdAt: videoComments.createdAt,
        userEmail: users.email,
        familyName: users.familyName,
        videoTitle: videos.title,
      })
      .from(videoComments)
      .innerJoin(users, eq(videoComments.userId, users.id))
      .innerJoin(videos, eq(videoComments.videoId, videos.id))
      .orderBy(videoComments.createdAt);
    return rows;
  }

  // Dashboard Banners
  async getBanners(activeOnly = false): Promise<DashboardBanner[]> {
    const q = db.select().from(dashboardBanners);
    if (activeOnly) {
      return q.where(eq(dashboardBanners.isActive, true)).orderBy(dashboardBanners.displayOrder);
    }
    return q.orderBy(dashboardBanners.displayOrder);
  }

  async getBannerById(id: string): Promise<DashboardBanner | undefined> {
    const [row] = await db.select().from(dashboardBanners).where(eq(dashboardBanners.id, id));
    return row;
  }

  async createBanner(data: InsertDashboardBanner): Promise<DashboardBanner> {
    const [row] = await db.insert(dashboardBanners).values(data).returning();
    return row;
  }

  async updateBanner(id: string, data: Partial<InsertDashboardBanner>): Promise<DashboardBanner> {
    const [row] = await db.update(dashboardBanners).set(data).where(eq(dashboardBanners.id, id)).returning();
    return row;
  }

  async deleteBanner(id: string): Promise<void> {
    await db.delete(dashboardBanners).where(eq(dashboardBanners.id, id));
  }

  async reorderBanners(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await db.update(dashboardBanners).set({ displayOrder: i }).where(eq(dashboardBanners.id, ids[i]));
    }
  }
}

export const storage = new DatabaseStorage();
