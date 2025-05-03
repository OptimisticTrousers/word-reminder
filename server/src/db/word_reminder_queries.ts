import { WordReminder } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const wordReminderQueries = (function () {
  const queries = createQueries<WordReminder>(["*"], "word_reminders");
  const { columns, db, deleteById, getById, table } = queries;

  const create = async ({
    user_id,
    finish,
    has_reminder_onload,
    is_active,
    reminder,
  }: {
    user_id: number;
    finish: Date;
    has_reminder_onload: boolean;
    is_active: boolean;
    reminder: string;
  }) => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
     INSERT INTO ${table}(user_id, finish, has_reminder_onload, is_active, reminder) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${columns};
      `,
      [user_id, finish, has_reminder_onload, is_active, reminder]
    );

    return rows[0];
  };

  const deleteByUserId = async (userId: number) => {
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

  const updateById = async (
    id: number,
    {
      finish,
      has_reminder_onload,
      is_active,
      reminder,
    }: {
      finish: Date;
      has_reminder_onload: boolean;
      is_active: boolean;
      reminder: string;
    }
  ) => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
    UPDATE ${table}
    SET finish = $2, has_reminder_onload = $3, is_active = $4, reminder = $5
    WHERE id = $1
    RETURNING ${columns};
      `,
      [id, finish, has_reminder_onload, is_active, reminder]
    );

    return rows[0];
  };

  return {
    create,
    deleteByUserId,
    deleteById: deleteById.bind(queries),
    getById: getById.bind(queries),
    updateById,
  };
})();
