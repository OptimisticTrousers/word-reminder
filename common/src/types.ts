export enum Template {
  CHANGE_EMAIL = "change_email",
  CHANGE_PASSWORD = "change_password",
  FORGOT_PASSWORD = "forgot_password",
  CONFIRM_ACCOUNT = "confirm_account",
}

export enum Subject {
  CHANGE_EMAIL = "Word Reminder - Change Email",
  CHANGE_PASSWORD = "Word Reminder - Change Password",
  FORGOT_PASSWORD = "Word Reminder - Forgot Password",
  CONFIRM_ACCOUNT = "Word Reminder - Confirm Account",
}

export enum Column {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}

export interface User {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: Date;
  updated_at: Date;
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

export interface Word {
  id: number;
  details: Detail[];
}

export interface ImageJson {
  query: {
    pages: Record<string, { title: string; imageinfo: Image[] }>;
  };
}

export interface Image {
  id: number;
  word_id: number;
  url: string;
  descriptionurl: string;
  comment: string;
}

export interface Page {
  page: number;
  limit: number;
}

export interface UserWord {
  id: number;
  word_id: number;
  user_id: number;
  learned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WordReminder {
  id: number;
  user_id: number;
  finish: Date;
  reminder: string;
  has_reminder_onload: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWordsWordReminders {
  id: number;
  user_word_id: number;
  word_reminder_id: number;
}

export enum SortMode {
  Newest = "newest",
  Oldest = "oldest",
  Random = "random",
}

export interface AutoWordReminder {
  id: number;
  user_id: number;
  is_active: boolean;
  has_learned_words: boolean;
  has_reminder_onload: boolean;
  sort_mode: SortMode;
  reminder: string;
  duration: number;
  word_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: number;
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface Token {
  token: string;
  expires_at: Date;
}
