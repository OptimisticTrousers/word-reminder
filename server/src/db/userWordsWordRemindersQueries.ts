import { QueryResult } from "pg";

import { Queries } from "./queries";

interface UserWordsWordReminders {
  id: string;
  user_word_id: string;
  word_reminder_id: string;
}

export class UserWordsWordRemindersQueries extends Queries<UserWordsWordReminders> {
  constructor() {
    super(["*"], "user_words_word_reminders");
  }

  async create({
    userId,
    userWordId,
    wordReminderId,
  }: {
    userId: string;
    userWordId: string;
    wordReminderId: string;
  }): Promise<UserWordsWordReminders> {
    const { rows }: QueryResult<UserWordsWordReminders> = await this.pool.query(
      `
    INSERT INTO ${this.table}(user_id, user_word_id word_reminder_id)
    VALUES ($1, $2, $3)
    RETURNING ${this.columns}
      `,
      [userId, userWordId, wordReminderId]
    );

    return rows[0];
  }

  async deleteAllByUserId(userId: string): Promise<UserWordsWordReminders[]> {
    const { rows }: QueryResult<UserWordsWordReminders> = await this.pool.query(
      `
    DELETE FROM ${this.table}
    WHERE user_id = $1
    RETURNING ${this.columns};
      `,
      [userId]
    );

    return rows;
  }
}
