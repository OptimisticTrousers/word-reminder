import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface WordReminder extends WordReminderParams {
  id: string;
  created_at: Date;
  updated_at: Date;
}

interface WordReminderParams {
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

export class WordReminderQueries extends Queries<WordReminder> {
  constructor() {
    super(["*"], "word_reminders");
  }

  async create(wordReminder: WordReminderParams): Promise<WordReminder> {
    const { rows }: QueryResult<WordReminder> = await this.pool.query(
      `
     INSERT INTO ${this.table}(user_id, reminder, is_active, has_reminder_onload, finish) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${this.columns}
      `,
      [
        wordReminder.user_id,
        wordReminder.reminder,
        wordReminder.is_active,
        wordReminder.has_reminder_onload,
        wordReminder.finish,
      ]
    );

    return rows[0];
  }

  async deleteAllByUserId(userId: string): Promise<WordReminder[]> {
    const { rows }: QueryResult<WordReminder> = await this.pool.query(
      `
    DELETE FROM ${this.table}
    WHERE user_id = $1
    RETURNING ${this.columns};
      `,
      [userId]
    );

    return rows;
  }

  async deleteById(id: string): Promise<WordReminder> {
    const { rows } = await this.pool.query(
      `
    DELETE 
    FROM ${this.table}
    WHERE id = $1
    RETURNING ${this.columns};
      `,
      [id]
    );

    return rows[0];
  }

  async update({
    id,
    finish,
    reminder,
    is_active,
    has_reminder_onload,
  }: {
    id: string;
    finish: Date;
    reminder: string;
    is_active: boolean;
    has_reminder_onload: boolean;
  }): Promise<WordReminder> {
    const { rows }: QueryResult<WordReminder> = await this.pool.query(
      `
    UPDATE ${this.table}
    SET finish = $1, reminder = $2, is_active = $3, has_reminder_onload = $4
    WHERE id = $5
    RETURNING ${this.columns}
      `,
      [finish, reminder, is_active, has_reminder_onload, id]
    );

    return rows[0];
  }
}
