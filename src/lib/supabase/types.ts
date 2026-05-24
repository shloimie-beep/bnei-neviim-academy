// Hand-written types matching `supabase-schema.sql`. Keep in sync if the
// schema changes. Single source of truth for DB row shapes used by the
// server/API routes.

export type Locale = 'he' | 'en';
export type Approval = 'pending' | 'approved' | 'rejected';

export type Role = 'kid' | 'parent';
export type Frequency = 'daily';
export type NotificationChannel = 'telegram' | 'email';

/**
 * Row from the `users` table. Kids have `pin_hash` set, parents have `email`
 * set. The same table holds both — `role` discriminates.
 */
export interface User {
  id: string;
  role: Role;
  name: string;
  email: string | null;
  pin_hash: string | null;
  language: Locale;
  frozen: boolean;
  created_at: string;
}

/** Narrowed `User` view for kid rows. */
export interface Kid extends User {
  role: 'kid';
}

/** Narrowed `User` view for parent rows. */
export interface Parent extends User {
  role: 'parent';
  email: string;
}

export interface Meeting {
  id: string;
  kid_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  recording_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  meeting_id: string;
  kid_id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  display_order: number;
  created_at: string;
}

export interface Checkin {
  id: string;
  goal_id: string;
  kid_id: string;
  date: string; // ISO date
  completed: boolean;
  proof_note: string | null;
  proof_photo_path: string | null;
  /** null = pending, true = approved, false = rejected */
  approved: boolean | null;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  body: string | null;
  delivered: boolean;
  error: string | null;
  related_kid_id: string | null;
  created_at: string;
}

export interface UserPreference {
  user_id: string;
  language: Locale;
  updated_at: string;
}

/**
 * Helper to convert the nullable `approved` boolean into the friendlier
 * `Approval` discriminated string. Use this at view boundaries only — the
 * DB representation stays as `boolean | null`.
 */
export function toApproval(approved: boolean | null): Approval {
  if (approved === null) return 'pending';
  return approved ? 'approved' : 'rejected';
}
