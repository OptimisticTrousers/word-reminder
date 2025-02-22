import { QueryResult } from "pg";

import { createQueries } from "./queries";
import { WordReminder } from "common";

interface Page {
  page: number;
  limit: number;
}

interface UserWordsWordReminders {
  id: string;
  user_word_id: string;
  word_reminder_id: string;
}

export interface Result {
  wordReminders: WordReminder[];
  previous?: Page;
  next?: Page;
}

export const userWordsWordRemindersQueries = (function () {
  const { columns, db, table } = createQueries(
    ["*"],
    "user_words_word_reminders"
  );

  const create = async ({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: string;
    word_reminder_id: string;
  }): Promise<UserWordsWordReminders> => {
    const existingUserWordsWordReminders: UserWordsWordReminders = await get({
      user_word_id,
      word_reminder_id,
    });

    if (existingUserWordsWordReminders) {
      return existingUserWordsWordReminders;
    }

    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    INSERT INTO ${table}(user_word_id, word_reminder_id)
    VALUES ($1, $2)
    RETURNING ${columns}
      `,
      [user_word_id, word_reminder_id]
    );

    return rows[0];
  };

  const deleteAllByUserId = async (
    user_id: string
  ): Promise<UserWordsWordReminders[]> => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    DELETE FROM ${table}
    USING user_words
    WHERE user_words.id = ${table}.user_word_id AND user_words.user_id = $1
    RETURNING ${table}.id, user_word_id, word_reminder_id;
      `,
      [user_id]
    );

    return rows;
  };

  const deleteAllByWordReminderId = async (
    word_reminder_id: string
  ): Promise<UserWordsWordReminders[]> => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    DELETE FROM ${table}
    USING word_reminders
    WHERE word_reminder_id = word_reminders.id AND word_reminder_id = $1
    RETURNING user_words_word_reminders.id, user_word_id, word_reminder_id;
      `,
      [word_reminder_id]
    );

    return rows;
  };

  const get = async ({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: string;
    word_reminder_id: string;
  }): Promise<UserWordsWordReminders> => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    SELECT * FROM user_words_word_reminders
    WHERE user_word_id = $1 AND word_reminder_id = $2
      `,
      [user_word_id, word_reminder_id]
    );

    return rows[0];
  };

  const getByUserId = async (
    user_id: string,
    options: {
      page?: number;
      limit?: number;
      // direction refers to whether the column should be sorted in ascending (1) or descending (-1) order
      sort?: { table: string; direction: number; column: string };
    } = {}
  ): Promise<Result> => {
    const page: number = options.page || 1;
    const limit: number = options.limit || 8;
    const startIndex = (page - 1) * limit;

    const queryParts = [
      `
    SELECT word_reminders.id,
           word_reminders.reminder,
           word_reminders.is_active,
           word_reminders.has_reminder_onload,
           word_reminders.finish,
           JSON_AGG(
            JSON_BUILD_OBJECT(
              'learned', user_words.learned,
              'details', words.details
            )
           ) AS user_words
    FROM ${table}
    JOIN user_words 
    ON user_words.id = ${table}.user_word_id
    JOIN words
    ON words.id = user_words.word_id
    JOIN word_reminders
    ON word_reminders.id = ${table}.word_reminder_id
      `,
      `
    WHERE word_reminders.user_id = $1
    GROUP BY word_reminders.id
      `,
    ];
    const queryParams: unknown[] = [user_id, limit, startIndex];

    if (options.sort) {
      const sortClause = options.sort;
      queryParts.push(
        `ORDER BY ${sortClause.table}.${sortClause.column} ${
          sortClause.direction === 1 ? "ASC" : "DESC"
        }`
      );
    }

    // Pagination
    queryParts.push(`LIMIT $2 OFFSET $3;`);

    const query: string = queryParts.join(" ");
    const { rows }: QueryResult<WordReminder> = await db.query(
      query,
      queryParams
    );

    // Total Rows Calculation
    const totalQuery = `
      SELECT COUNT(*) AS total FROM word_reminders
      WHERE user_id = $1;
    `;
    const { rows: totalRowsResult }: QueryResult<{ total: number }> =
      await db.query(totalQuery, [user_id]);
    // calculate the length of the rows before applying a limit on it to see how many rows match the query
    const totalRows = totalRowsResult[0].total;

    let result: Result = { wordReminders: rows };

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
  };

  return { create, deleteAllByUserId, deleteAllByWordReminderId, getByUserId };
})();
