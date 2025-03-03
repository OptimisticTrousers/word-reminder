export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface License {
  name: string;
  url: string;
}

export interface Detail {
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  word: string;
  origin?: string;
  license?: License;
  sourceUrls?: string[];
}

export enum Order {
  Newest = "newest",
  Oldest = "oldest",
  Random = "random",
}

export interface Id {
  id: string;
}

export interface Page {
  title: string;
  imageinfo: Image[];
}

export interface ImageJson {
  query: {
    pages: Record<string, Page>;
  };
}

export interface Word extends Id {
  details: Detail[];
  images?: Image[];
  created_at: Date;
}

export interface Image extends Omit<ImageParams, "title" | "word_id"> {
  comment: string;
}

export interface ImageParams {
  url: string;
  descriptionurl: string;
  title?: string;
  comment?: string;
  word_id: string;
}
export interface User extends Id {
  email: string;
  confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWord extends Id {
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionParams {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export enum Templates {
  CHANGE_EMAIL = "change_email",
  CHANGE_PASSWORD = "change_password",
  FORGOT_PASSWORD = "forgot_password",
  CONFIRM_EMAIL = "confirm_email",
}

export enum Subject {
  EMAIL_VERIFICATION = "Verify Your Email",
  CHANGE_VERIFICATION = "Change Account Details",
}

// Defines how often a reminder notification is sent to the user which will include all of the words in this word reminder.
export interface AddToDate extends Id {
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
}

export interface WordReminder extends Id {
  created_at: Date;
  updated_at: Date;
  user_id: string;
  finish: Date;
  // End date and time when the reminder is no longer active.
  has_reminder_onload: boolean;
  // Determines if the reminder should be shown immediately upon loading the application or feature. One notification will be shown if at least one notification was emitted after the last time the user signed onto the application.
  is_active: boolean;
}

export interface AutoWordReminder extends Id {
  user_id: string;
  is_active: boolean;
  has_learned_words: boolean;
  has_reminder_onload: boolean;
  order: Order;
  word_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface AddToDateParams {
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
}

interface WordReminderParams {
  user_id: string;
  has_reminder_onload: boolean;
  is_active: boolean;
  reminder: AddToDateParams;
}

export interface WordReminderDbParams {
  user_id: string;
  has_reminder_onload: boolean;
  is_active: boolean;
  finish: Date;
}

export interface AutoWordReminderDbParams {
  user_id: string;
  is_active: boolean;
  has_reminder_onload: boolean;
  has_learned_words: boolean;
  order: Order;
  word_count: number;
}

export interface AddToDatesAutoWordReminder extends Id {
  auto_word_reminder_id: string;
  reminder_id: string;
  duration_id: string;
}

export interface AddToDatesAutoWordReminderDbParams {
  auto_word_reminder_id: string;
  reminder_id: string;
  duration_id: string;
}

export interface AddToDatesWordReminder extends Id {
  word_reminder_id: string;
  reminder_id: string;
}

export interface AddToDatesWordReminderDbParams {
  word_reminder_id: string;
  reminder_id: string;
}

export interface ManualWordReminderParams extends WordReminderParams {
  finish: Date;
  user_words: string[];
}

// create_now
export interface AutoWordReminderParams extends WordReminderParams {
  user_id: string;
  has_learned_words: boolean;
  order: Order;
  word_count: number;
  create_now: boolean;
  duration: AddToDateParams;
}

export interface AuthParams {
  email: string;
  password: string;
}
