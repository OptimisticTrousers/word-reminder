import { QueryResult } from "pg";
import {
  AutoWordReminderDbParams,
  AutoWordReminder,
  AddToDatesAutoWordReminder,
} from "common";
import { createQueries } from "./queries";

export const autoWordReminderQueries = (function () {
  const queries = createQueries<AutoWordReminder>(["*"], "auto_word_reminders");
  const { columns, db, getById, deleteById, table } = queries;

  const create = async ({
    user_id,
    is_active,
    has_reminder_onload,
    has_learned_words,
    order,
    word_count,
  }: AutoWordReminderDbParams): Promise<AutoWordReminder> => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    INSERT INTO ${table}(user_id, is_active, has_reminder_onload, has_learned_words, "order", word_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${columns};
      `,
      [
        user_id,
        is_active,
        has_reminder_onload,
        has_learned_words,
        order,
        word_count,
      ]
    );

    return rows[0];
  };

  const getByUserId = async (userId: string): Promise<AutoWordReminder[]> => {
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
    id: string,
    {
      user_id,
      is_active,
      has_reminder_onload,
      has_learned_words,
      order,
      word_count,
    }: AutoWordReminderDbParams
  ): Promise<AutoWordReminder> => {
    const { rows }: QueryResult<AutoWordReminder> = await db.query(
      `
    UPDATE ${table}
    SET user_id = $1, is_active = $2, has_reminder_onload = $3, has_learned_words = $4, order = $5, word_count = $6
    WHERE id = $7
    RETURNING ${columns};
      `,
      [
        user_id,
        is_active,
        has_reminder_onload,
        has_learned_words,
        order,
        word_count,
        id,
      ]
    );

    return rows[0];
  };

  return {
    create,
    getByUserId,
    deleteById: deleteById.bind(queries),
    updateById,
    getById: getById.bind(queries),
  };
})();
