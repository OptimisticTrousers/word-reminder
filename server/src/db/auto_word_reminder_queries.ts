import { AutoWordReminder, SortMode } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const autoWordReminderQueries = (function () {
  const queries = createQueries<AutoWordReminder>(["*"], "auto_word_reminders");
  const { columns, db, getById, deleteById, table } = queries;

  const create = async ({
    user_id,
    is_active,
    has_reminder_onload,
    has_learned_words,
    sort_mode,
    word_count,
    reminder,
    duration,
  }: {
    user_id: number;
    is_active: boolean;
    has_reminder_onload: boolean;
    has_learned_words: boolean;
    sort_mode: SortMode;
    word_count: number;
    reminder: string;
    duration: number;
  }) => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    INSERT INTO ${table}(user_id, is_active, has_reminder_onload, has_learned_words, sort_mode, word_count, reminder, duration)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${columns};
      `,
      [
        user_id,
        is_active,
        has_reminder_onload,
        has_learned_words,
        sort_mode,
        word_count,
        reminder,
        duration,
      ]
    );

    return rows[0];
  };

  const deleteByUserId = async (userId: number) => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    DELETE FROM ${table}
    WHERE ${table}.user_id = $1
    RETURNING ${columns};
      `,
      [userId]
    );

    return rows[0];
  };

  const getByUserId = async (userId: number) => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    SELECT ${columns} 
    FROM ${table}
    WHERE user_id = $1;
      `,
      [userId]
    );

    return rows;
  };

  const updateById = async (
    id: number,
    {
      is_active,
      has_reminder_onload,
      has_learned_words,
      sort_mode,
      word_count,
      reminder,
      duration,
    }: {
      is_active: boolean;
      has_reminder_onload: boolean;
      has_learned_words: boolean;
      sort_mode: SortMode;
      word_count: number;
      reminder: string;
      duration: number;
    }
  ) => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    UPDATE ${table}
    SET is_active = $2, has_reminder_onload = $3, has_learned_words = $4, sort_mode = $5, word_count = $6, reminder = $7, duration = $8
    WHERE id = $1
    RETURNING ${columns};
      `,
      [
        id,
        is_active,
        has_reminder_onload,
        has_learned_words,
        sort_mode,
        word_count,
        reminder,
        duration,
      ]
    );

    return rows[0];
  };

  return {
    create,
    deleteById: deleteById.bind(queries),
    deleteByUserId,
    getById: getById.bind(queries),
    getByUserId,
    updateById,
  };
})();
