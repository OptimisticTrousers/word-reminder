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

export interface Word {
  id: string;
  details: Detail[];
  images?: Image[];
  created_at: Date;
}

export interface Image {
  src: string;
  caption: string;
}
export interface User {
  id: string;
  auto: boolean;
  email: string;
  confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWord {
  id: string;
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
  EMAIL_VERIFICATION = "email_verification",
  CHANGE_VERIFICATION = "change_verification",
}

export enum Subject {
  EMAIL_VERIFICATION = "Verify Your Email",
  CHANGE_VERIFICATION = "Change Account Details",
}

export interface WordReminder {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  finish: Date;
  // End date and time when the reminder is no longer active.
  has_reminder_onload: boolean;
  // Determines if the reminder should be shown immediately upon loading the application or feature. One notification will be shown if at least one notification was emitted after the last time the user signed onto the application.
  is_active: boolean;
  // Specifies if the reminder is active
  reminder: string;
  // Defines how often a reminder notification is sent to the user which will include all of the words in this word reminder.
}

interface WordReminderParams {
  auto: boolean;
  has_reminder_onload: boolean;
  is_active: boolean;
  reminder: string;
}

export interface ManualWordReminderParams extends WordReminderParams {
  finish: Date;
  user_words: string[];
}

export interface AutoWordReminderParams extends WordReminderParams {
  create_now: boolean;
  duration: string;
  word_count: number;
  has_learned_words: boolean;
  order: Order;
}
