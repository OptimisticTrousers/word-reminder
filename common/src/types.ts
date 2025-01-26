interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface License {
  name: string;
  url: string;
}

export type Json = {
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  word: string;
  origin?: string;
  license?: License;
  sourceUrls?: string[];
}[];

export interface Word {
  id: string;
  details: Json;
  created_at: Date;
}
export interface User {
  id: string;
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
  CHANGE_EMAIL_VERIFICATION = "change_email_verification",
  CHANGE_PASSWORD_VERIFICATION = "change_password_verification",
}

export enum Subject {
  EMAIL_VERIFICATION = "Verify Your Email",
  CHANGE_EMAIL_VERIFICATION = "Change Email",
  CHANGE_PASSWORD_VERIFICATION = "Change Password",
}

export interface WordReminder extends WordReminderParams {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface WordReminderParams {
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
