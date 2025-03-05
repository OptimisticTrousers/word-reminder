import { Detail, Page, UserWordsWordReminders, WordReminder } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export interface Result {
  wordReminders: WordReminder[];
  previous?: Page;
  next?: Page;
}

export const userWordsWordRemindersQueries = (function () {
  const tableName = "user_words_word_reminders";
  const { columns, db, table } = createQueries<UserWordsWordReminders>(
    [
      `${tableName}.id`,
      `${tableName}.user_word_id`,
      `${tableName}.word_reminder_id`,
    ],
    tableName
  );

  const create = async ({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: number;
    word_reminder_id: number;
  }) => {
    const existingUserWordsWordReminders = await get({
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

  const deleteByUserId = async (user_id: number) => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    DELETE FROM ${table}
    USING user_words
    WHERE user_words.id = ${table}.user_word_id 
    AND user_words.user_id = $1
    RETURNING ${columns};
      `,
      [user_id]
    );

    return rows;
  };

  const deleteByWordReminderId = async (word_reminder_id: number) => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    DELETE FROM ${table}
    USING word_reminders
    WHERE word_reminder_id = word_reminders.id 
    AND word_reminder_id = $1
    RETURNING ${columns};
      `,
      [word_reminder_id]
    );

    return rows;
  };

  const get = async ({
    user_word_id,
    word_reminder_id,
  }: {
    user_word_id: number;
    word_reminder_id: number;
  }) => {
    const { rows }: QueryResult<UserWordsWordReminders> = await db.query(
      `
    SELECT * FROM user_words_word_reminders
    WHERE user_word_id = $1 AND word_reminder_id = $2
      `,
      [user_word_id, word_reminder_id]
    );

    return rows[0];
  };

  const getByWordReminderId = async (wordReminderId: number) => {
    const {
      rows,
    }: QueryResult<
      WordReminder & { user_words: { details: Detail[]; learned: boolean }[] }
    > = await db.query(
      `
    SELECT word_reminders.id,
           word_reminders.finish,
           word_reminders.has_reminder_onload,
           word_reminders.is_active,
           word_reminders.reminder,
           word_reminders.created_at,
           word_reminders.updated_at,
           JSON_AGG(
            JSON_BUILD_OBJECT(
              'learned', user_words.learned,
              'created_at', user_words.created_at,
              'updated_at', user_words.updated_at,
              'details', words.details,
              'id', user_words.id
            )
           ) AS user_words
    FROM ${table}
    JOIN user_words 
    ON user_words.id = ${table}.user_word_id
    JOIN words
    ON words.id = user_words.word_id
    JOIN word_reminders
    ON word_reminders.id = ${table}.word_reminder_id
    WHERE word_reminders.id = $1
    GROUP BY word_reminders.id;
      `,
      [wordReminderId]
    );

    return rows[0];
  };

  const getByUserId = async (
    user_id: number,
    options: {
      page?: number;
      limit?: number;
      // direction refers to whether the column should be sorted in ascending (1) or descending (-1) order
      sort?: { table: string; direction: number; column: string };
    } = {}
  ) => {
    const page = options.page || 1;
    const limit = options.limit || 8;
    const startIndex = (page - 1) * limit;

    const queryParts = [
      `
    SELECT word_reminders.id,
           word_reminders.finish,
           word_reminders.has_reminder_onload,
           word_reminders.is_active,
           word_reminders.reminder,
           word_reminders.created_at,
           word_reminders.updated_at,
           JSON_AGG(
            JSON_BUILD_OBJECT(
              'learned', user_words.learned,
              'created_at', user_words.created_at,
              'updated_at', user_words.updated_at,
              'details', words.details,
              'id', user_words.id
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

    const query = queryParts.join(" ");
    const {
      rows,
    }: QueryResult<
      WordReminder & { user_words: { details: Detail[]; learned: boolean } }
    > = await db.query(query, queryParams);

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

  return {
    create,
    deleteByUserId,
    deleteByWordReminderId,
    getByWordReminderId,
    getByUserId,
  };
})();
