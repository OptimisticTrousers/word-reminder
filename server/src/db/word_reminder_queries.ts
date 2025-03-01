import { WordReminder, WordReminderDbParams } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const wordReminderQueries = (function () {
  const queries = createQueries<WordReminder>(["*"], "word_reminders");
  const { columns, db, getById, table } = queries;

  const create = async (
    wordReminder: WordReminderDbParams
  ): Promise<WordReminder> => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
     INSERT INTO ${table}(user_id, is_active, has_reminder_onload, finish) 
     VALUES ($1, $2, $3, $4)
     RETURNING ${columns}
      `,
      [
        wordReminder.user_id,
        wordReminder.is_active,
        wordReminder.has_reminder_onload,
        wordReminder.finish,
      ]
    );

    return rows[0];
  };

  const deleteAllByUserId = async (userId: string): Promise<WordReminder[]> => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
    DELETE FROM ${table}
    WHERE user_id = $1
    RETURNING ${columns};
      `,
      [userId]
    );

    return rows;
  };

  const deleteById = async (id: string): Promise<WordReminder> => {
    const { rows } = await db.query(
      `
    DELETE 
    FROM ${table}
    WHERE id = $1
    RETURNING ${columns};
      `,
      [id]
    );

    return rows[0];
  };

  const update = async ({
    id,
    finish,
    is_active,
    has_reminder_onload,
  }: Omit<WordReminderDbParams, "user_id"> & {
    id: string;
  }): Promise<WordReminder> => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
    UPDATE ${table}
    SET finish = $1, is_active = $2, has_reminder_onload = $3
    WHERE id = $4
    RETURNING ${columns};
      `,
      [finish, is_active, has_reminder_onload, id]
    );

    return rows[0];
  };

  return {
    create,
    deleteAllByUserId,
    deleteById,
    getById: getById.bind(queries),
    update,
  };
})();
