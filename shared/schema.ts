import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for admin and customer accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // 'admin' or 'customer'
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("none"), // 'none', 'trial', 'active', 'cancelled', 'past_due'
  trialEndsAt: timestamp("trial_ends_at"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Menu options mapping audio files to IVR options
export const menuOptions = pgTable("menu_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentMenuId: varchar("parent_menu_id"), // null for main menu, or ID of parent submenu
  optionNumber: integer("option_number").notNull(), // 1-9
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
  isSubscriber: boolean("is_subscriber").default(false),
  menuSelection: integer("menu_selection"),
  duration: integer("duration"), // in seconds
  status: text("status"), // 'completed', 'busy', 'no-answer', etc.
  createdAt: timestamp("created_at").defaultNow(),
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

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const phoneNumberSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PhoneNumberInput = z.infer<typeof phoneNumberSchema>;
