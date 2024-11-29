import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface WordReminder extends WordReminderParams {
  id: string;
  created_at: Date;
  updated_at: Date;
}

interface WordReminderParams {
  user_id: string;
  word_ids: string[];
  from: Date;
  // Start date and time when the reminder becomes active.
  to: Date;
  // End date and time when the reminder is no longer active.
  hasReminderOnload: boolean;
  // Determines if the reminder should be shown immediately upon loading the application or feature. One notification will be shown if at least one notification was emitted after the last time the user signed onto the application.
  isRecurring: boolean;
  // Specifies if the reminder repeats at regular intervals.
  duration: string;
  // Defines the interval for recurring reminders (e.g., "daily", "weekly").
  // Relevant only if `isRecurring` is `true`.
  reminder: string;
  // Defines how often a reminder notification is sent to the user which will include all of the words in this word reminder.
}

export class WordReminderQueries extends Queries<WordReminder> {
  constructor() {
    super(["*"], "words");
  }

  async create(wordReminder: WordReminder) {
    const { rows }: QueryResult<WordReminder> = await this.pool.query(
      `
     INSERT INTO word_reminders() 
     VALUES
     RETURNING *
      `, []);

    return rows[0];
  }
}
