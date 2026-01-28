import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (used by connect-pg-simple for user login sessions)
// Note: This table is managed by connect-pg-simple, schema defined here to prevent accidental deletion
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => [
  { name: "IDX_session_expire", columns: [table.expire] }
]);

// Users table - for admin and customer accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  familyName: text("family_name"),
  location: text("location"), // city/state/country
  role: text("role").notNull().default("customer"), // 'admin' or 'customer'
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("none"), // 'none', 'trial', 'active', 'cancelled', 'past_due'
  trialEndsAt: timestamp("trial_ends_at"),
  hasUsedTrial: boolean("has_used_trial").default(false), // Track if user has ever started a trial
  createdAt: timestamp("created_at").defaultNow(),
});

// Phone numbers associated with subscriptions
export const phoneNumbers = pgTable("phone_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phoneNumber: text("phone_number").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audio files for the hotline
export const audioFiles = pgTable("audio_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  duration: integer("duration"), // in seconds
  type: text("type").notNull().default("story"), // 'greeting', 'story', 'menu', 'non_subscriber'
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  voitexAlbum: text("voitex_album"), // Voitex album number for playback
  voitexSort: text("voitex_sort"), // Voitex sort number within album
  voitexRecordingId: text("voitex_recording_id"), // Voitex internal recording ID
  createdAt: timestamp("created_at").defaultNow(),
});

// Menu options mapping audio files to IVR options
export const menuOptions = pgTable("menu_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentMenuId: varchar("parent_menu_id"), // null for main menu, or ID of parent submenu
  optionNumber: integer("option_number").notNull(), // 1-9
  label: text("label"), // Display label for the menu option
  functionType: text("function_type").notNull().default("none"), // 'none', 'play_mp3', 'transfer', 'submenu', 'conference'
  audioFileId: varchar("audio_file_id").references(() => audioFiles.id), // for play_mp3
  transferNumber: text("transfer_number"), // for transfer
  transferTimeout: integer("transfer_timeout"), // for transfer (minutes)
  submenuGreetingId: varchar("submenu_greeting_id").references(() => audioFiles.id), // greeting for submenu
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings for greetings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  audioFileId: varchar("audio_file_id").references(() => audioFiles.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conference sessions for tracking active conferences
export const conferenceSessions = pgTable("conference_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conferenceName: text("conference_name").notNull(),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Participants in conference calls
export const conferenceParticipants = pgTable("conference_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => conferenceSessions.id),
  callUuid: text("call_uuid").notNull(),
  phoneNumber: text("phone_number").notNull(),
  memberId: text("member_id"),
  isMuted: boolean("is_muted").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

// Unmute requests from participants
export const unmuteRequests = pgTable("unmute_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => conferenceParticipants.id),
  sessionId: varchar("session_id").references(() => conferenceSessions.id),
  phoneNumber: text("phone_number").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'denied'
  requestedAt: timestamp("requested_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Call logs for analytics
export const callLogs = pgTable("call_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callUuid: text("call_uuid").notNull(),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  userId: varchar("user_id").references(() => users.id), // link to subscriber
  isSubscriber: boolean("is_subscriber").default(false),
  menuSelection: integer("menu_selection"),
  duration: integer("duration"), // in seconds
  status: text("status"), // 'completed', 'busy', 'no-answer', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin whitelisted phone numbers (free access without subscription)
export const whitelistedNumbers = pgTable("whitelisted_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  label: text("label"), // optional note about who/why
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Whitelisted emails for free video access
export const whitelistedEmails = pgTable("whitelisted_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  label: text("label"), // optional note about who/why
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos for subscriber content
// Video categories for organizing content
export const videoCategories = pgTable("video_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  parentCategoryId: varchar("parent_category_id"), // null for top-level categories, ID for subcategories
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename"),
  filepath: text("filepath"),
  thumbnailPath: text("thumbnail_path"),
  duration: integer("duration"),
  fileSize: bigint("file_size", { mode: "number" }),
  viewCount: integer("view_count").default(0),
  status: text("status").notNull().default("processing"),
  mediaType: text("media_type").notNull().default("video"), // 'video' or 'audio'
  categoryId: varchar("category_id").references(() => videoCategories.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  bunnyVideoId: text("bunny_video_id"),
  bunnyGuid: text("bunny_guid"),
  storageType: text("storage_type").default("local"),
  bunnyStorageUrl: text("bunny_storage_url"),
  vimeoVideoId: text("vimeo_video_id"),
  vimeoEmbedUrl: text("vimeo_embed_url"), // Stores the player embed URL with hash for private videos
  vimeoCreatedAt: timestamp("vimeo_created_at"), // When video was created on Vimeo
  excludeFromRecent: boolean("exclude_from_recent").default(false), // Hide from Recent section in customer portal
});

// PDF documents for subscriber content
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  fileSize: integer("file_size"),
  pageCount: integer("page_count"),
  pageImages: text("page_images").array(), // Array of image paths for each page
  viewCount: integer("view_count").default(0),
  status: text("status").notNull().default("processing"), // 'processing', 'ready', 'hidden'
  allowDownload: boolean("allow_download").default(false),
  categoryId: varchar("category_id").references(() => videoCategories.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Per-user video view tracking for "New" badge
export const userVideoViews = pgTable("user_video_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  firstViewedAt: timestamp("first_viewed_at").defaultNow(),
});

// Albums - collection of audio tracks
export const albums = pgTable("albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailPath: text("thumbnail_path"),
  status: text("status").notNull().default("ready"), // 'ready', 'hidden'
  categoryId: varchar("category_id").references(() => videoCategories.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Album tracks - individual audio files within an album
export const albumTracks = pgTable("album_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => albums.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  trackNumber: integer("track_number").notNull(),
  filename: text("filename"),
  filepath: text("filepath"),
  bunnyStorageUrl: text("bunny_storage_url"),
  duration: integer("duration"),
  fileSize: bigint("file_size", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// RSS feed folders for organizing audio
export const rssFolders = pgTable("rss_folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// RSS audio items - converted to MP3 64kbps
// folderName is stored for reliable matching even if folders are recreated
export const rssAudioItems = pgTable("rss_audio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  folderId: varchar("folder_id").references(() => rssFolders.id, { onDelete: "set null" }),
  folderName: text("folder_name"), // Stored folder name for reliable matching by name
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(), // converted mp3 filename
  filepath: text("filepath").notNull(), // path to converted mp3
  originalFilename: text("original_filename"), // original upload filename
  duration: integer("duration"), // in seconds
  fileSize: integer("file_size"), // in bytes
  sortOrder: integer("sort_order").default(0), // for manual ordering
  createdAt: timestamp("created_at").defaultNow(),
});

// Track phone numbers that have been used in trials (to prevent reuse)
export const trialPhoneNumbers = pgTable("trial_phone_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  usedAt: timestamp("used_at").defaultNow(),
  releasedAt: timestamp("released_at"), // When admin releases it for reuse
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  phoneNumbers: many(phoneNumbers),
}));

export const phoneNumbersRelations = relations(phoneNumbers, ({ one }) => ({
  user: one(users, {
    fields: [phoneNumbers.userId],
    references: [users.id],
  }),
}));

export const audioFilesRelations = relations(audioFiles, ({ one, many }) => ({
  uploader: one(users, {
    fields: [audioFiles.uploadedBy],
    references: [users.id],
  }),
  menuOptions: many(menuOptions),
}));

export const menuOptionsRelations = relations(menuOptions, ({ one }) => ({
  audioFile: one(audioFiles, {
    fields: [menuOptions.audioFileId],
    references: [audioFiles.id],
  }),
}));

export const conferenceSessionsRelations = relations(conferenceSessions, ({ many }) => ({
  participants: many(conferenceParticipants),
  unmuteRequests: many(unmuteRequests),
}));

export const conferenceParticipantsRelations = relations(conferenceParticipants, ({ one }) => ({
  session: one(conferenceSessions, {
    fields: [conferenceParticipants.sessionId],
    references: [conferenceSessions.id],
  }),
}));

export const unmuteRequestsRelations = relations(unmuteRequests, ({ one }) => ({
  participant: one(conferenceParticipants, {
    fields: [unmuteRequests.participantId],
    references: [conferenceParticipants.id],
  }),
  session: one(conferenceSessions, {
    fields: [unmuteRequests.sessionId],
    references: [conferenceSessions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPhoneNumberSchema = createInsertSchema(phoneNumbers).omit({ id: true, createdAt: true });
export const insertAudioFileSchema = createInsertSchema(audioFiles).omit({ id: true, createdAt: true });
export const insertMenuOptionSchema = createInsertSchema(menuOptions).omit({ id: true, createdAt: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export const insertConferenceSessionSchema = createInsertSchema(conferenceSessions).omit({ id: true, startedAt: true });
export const insertConferenceParticipantSchema = createInsertSchema(conferenceParticipants).omit({ id: true, joinedAt: true });
export const insertUnmuteRequestSchema = createInsertSchema(unmuteRequests).omit({ id: true, requestedAt: true });
export const insertCallLogSchema = createInsertSchema(callLogs).omit({ id: true, createdAt: true });
export const insertWhitelistedNumberSchema = createInsertSchema(whitelistedNumbers).omit({ id: true, createdAt: true });
export const insertWhitelistedEmailSchema = createInsertSchema(whitelistedEmails).omit({ id: true, createdAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export const insertVideoCategorySchema = createInsertSchema(videoCategories).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true, viewCount: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, viewCount: true });
export const insertUserVideoViewSchema = createInsertSchema(userVideoViews).omit({ id: true, firstViewedAt: true });
export const insertTrialPhoneNumberSchema = createInsertSchema(trialPhoneNumbers).omit({ id: true, usedAt: true });
export const insertAlbumSchema = createInsertSchema(albums).omit({ id: true, createdAt: true });
export const insertAlbumTrackSchema = createInsertSchema(albumTracks).omit({ id: true, createdAt: true });
export const insertRssFolderSchema = createInsertSchema(rssFolders).omit({ id: true, createdAt: true });
export const insertRssAudioItemSchema = createInsertSchema(rssAudioItems).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type InsertPhoneNumber = z.infer<typeof insertPhoneNumberSchema>;
export type AudioFile = typeof audioFiles.$inferSelect;
export type InsertAudioFile = z.infer<typeof insertAudioFileSchema>;
export type MenuOption = typeof menuOptions.$inferSelect;
export type InsertMenuOption = z.infer<typeof insertMenuOptionSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type ConferenceSession = typeof conferenceSessions.$inferSelect;
export type InsertConferenceSession = z.infer<typeof insertConferenceSessionSchema>;
export type ConferenceParticipant = typeof conferenceParticipants.$inferSelect;
export type InsertConferenceParticipant = z.infer<typeof insertConferenceParticipantSchema>;
export type UnmuteRequest = typeof unmuteRequests.$inferSelect;
export type InsertUnmuteRequest = z.infer<typeof insertUnmuteRequestSchema>;
export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type WhitelistedNumber = typeof whitelistedNumbers.$inferSelect;
export type InsertWhitelistedNumber = z.infer<typeof insertWhitelistedNumberSchema>;
export type WhitelistedEmail = typeof whitelistedEmails.$inferSelect;
export type InsertWhitelistedEmail = z.infer<typeof insertWhitelistedEmailSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type VideoCategory = typeof videoCategories.$inferSelect;
export type InsertVideoCategory = z.infer<typeof insertVideoCategorySchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UserVideoView = typeof userVideoViews.$inferSelect;
export type InsertUserVideoView = z.infer<typeof insertUserVideoViewSchema>;
export type TrialPhoneNumber = typeof trialPhoneNumbers.$inferSelect;
export type InsertTrialPhoneNumber = z.infer<typeof insertTrialPhoneNumberSchema>;
export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type AlbumTrack = typeof albumTracks.$inferSelect;
export type InsertAlbumTrack = z.infer<typeof insertAlbumTrackSchema>;
export type RssFolder = typeof rssFolders.$inferSelect;
export type InsertRssFolder = z.infer<typeof insertRssFolderSchema>;
export type RssAudioItem = typeof rssAudioItems.$inferSelect;
export type InsertRssAudioItem = z.infer<typeof insertRssAudioItemSchema>;

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(strongPasswordRegex, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  familyName: z.string().min(2, "Please enter your family name"),
  location: z.string().min(2, "Please enter your city/state/country"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  countryCode: z.string().default("+1"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const phoneNumberSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PhoneNumberInput = z.infer<typeof phoneNumberSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
