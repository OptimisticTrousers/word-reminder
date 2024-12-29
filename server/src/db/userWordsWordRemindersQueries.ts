import { QueryResult } from "pg";

import { Queries } from "./queries";
import { UserWord } from "./userWordQueries";
import { Word } from "./wordQueries";
import { WordReminder } from "./wordReminderQueries";

interface UserWordsWordReminders {
  id: string;
  user_word_id: string;
  word_reminder_id: string;
}

export interface Result {
  wordReminder:
    | Omit<WordReminder, "id" | "user_id" | "created_at" | "updated_at">
    | {};
  userWords: (UserWord & Word)[];
  previous?: Page;
  next?: Page;
}

interface Page {
  page: number;
  limit: number;
}

export class UserWordsWordRemindersQueries extends Queries<UserWordsWordReminders> {
  constructor() {
    super(["*"], "user_words_word_reminders");
  }

  async create({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: string;
    word_reminder_id: string;
  }): Promise<UserWordsWordReminders> {
    const existingUserWordsWordReminders: UserWordsWordReminders =
      await this.get({
        user_word_id,
        word_reminder_id,
      });

    if (existingUserWordsWordReminders) {
      return existingUserWordsWordReminders;
    }

    const { rows }: QueryResult<UserWordsWordReminders> = await this.pool.query(
      `
    INSERT INTO ${this.table}(user_word_id, word_reminder_id)
    VALUES ($1, $2)
    RETURNING ${this.columns}
      `,
      [user_word_id, word_reminder_id]
    );

    return rows[0];
  }

  private async get({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: string;
    word_reminder_id: string;
  }): Promise<UserWordsWordReminders> {
    const { rows }: QueryResult<UserWordsWordReminders> = await this.pool.query(
      `
    SELECT * FROM user_words_word_reminders
    WHERE user_word_id = $1 AND word_reminder_id = $2
      `,
      [user_word_id, word_reminder_id]
    );

    return rows[0];
  }

  async deleteAllByUserId(user_id: string): Promise<UserWordsWordReminders[]> {
    const { rows }: QueryResult<UserWordsWordReminders> = await this.pool.query(
      `
    DELETE FROM ${this.table}
    USING user_words
    WHERE user_words.id = ${this.table}.user_word_id AND user_words.user_id = $1
    RETURNING ${this.table}.id, user_word_id, word_reminder_id;
      `,
      [user_id]
    );

    return rows;
  }

  // async autoCreate({userId, wordCount, hasLearnedWords, isActive, reminder, hasReminderOnload, duration}: {userId: string, wordCount: number, hasLearnedWords: boolean, isActive: boolean, reminder: string, hasReminderOnload: boolean, duration: string}): Promise<WordReminder> {

  // }

  async deleteAllByWordReminderId(
    word_reminder_id: string
  ): Promise<(UserWordsWordReminders & WordReminder)[]> {
    const { rows }: QueryResult<UserWordsWordReminders & WordReminder> =
      await this.pool.query(
        `
    DELETE FROM ${this.table}
    USING word_reminder
    WHERE word_reminder_id = word_reminders.id AND word_reminder_id = $1
    RETURNING ${this.columns}
      `,
        [word_reminder_id]
      );

    return rows;
  }

  async getByUserId(
    user_id: string,
    options?: { page?: number; limit?: number }
  ): Promise<Result> {
    const queryParts = [
      `
    SELECT user_words.learned, words.details
    FROM ${this.table}
    JOIN user_words 
    ON user_words.id = ${this.table}.user_word_id
    JOIN words
    ON words.id = user_words.word_id
    JOIN word_reminders
    ON word_reminders.id = ${this.table}.word_reminder_id
      `,
      `
    WHERE word_reminders.user_id = $1
      `,
    ];
    const queryParams: unknown[] = [user_id];

    const page: number = options?.page || 1;
    const limit: number = options?.limit || 8;
    const startIndex = (page - 1) * limit;
    const { rows: preLimitRows }: QueryResult<Word & UserWord & WordReminder> =
      await this.pool.query(queryParts.join(" "), queryParams);
    // calculate the length of the rows before applying a limit on it to see how many rows match the query
    const totalRows = preLimitRows.length;
    if (!totalRows) {
      return { userWords: [], wordReminder: {} };
    }

    if (options?.page && options?.limit) {
      queryParts.push(`LIMIT $2 OFFSET $3`);
      queryParams.push(options.limit, startIndex);
    }

    const query: string = queryParts.join(" ");
    const { rows }: QueryResult<Word & UserWord & WordReminder> =
      await this.pool.query(query, queryParams);

    const { rows: wordReminders }: QueryResult<WordReminder> =
      await this.pool.query(
        `
      SELECT * FROM word_reminders 
      WHERE user_id = $1
        `,
        [user_id]
      );
    const wordReminder = {
      reminder: wordReminders[0].reminder,
      is_active: wordReminders[0].is_active,
      has_reminder_onload: wordReminders[0].has_reminder_onload,
      finish: wordReminders[0].finish,
    };

    let result: Result = { wordReminder, userWords: rows };
    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit,
      };
    }

    const endIndex = page * limit;
    if (endIndex < totalRows) {
      result.next = {
        page: page + 1,
        limit,
      };
    }

    return result;
  }
}
