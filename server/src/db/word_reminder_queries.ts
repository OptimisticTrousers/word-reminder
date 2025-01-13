import { QueryResult } from "pg";

import { createQueries } from "./queries";

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

export const wordReminderQueries = (function () {
  const queries = createQueries<WordReminder>(["*"], "word_reminders");
  const { columns, db, getById, table } = queries;

  const create = async (
    wordReminder: WordReminderParams
  ): Promise<WordReminder> => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
     INSERT INTO ${table}(user_id, reminder, is_active, has_reminder_onload, finish) 
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${columns}
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
    reminder,
    is_active,
    has_reminder_onload,
  }: {
    id: string;
    finish: Date;
    reminder: string;
    is_active: boolean;
    has_reminder_onload: boolean;
  }): Promise<WordReminder> => {
    const { rows }: QueryResult<WordReminder> = await db.query(
      `
    UPDATE ${table}
    SET finish = $1, reminder = $2, is_active = $3, has_reminder_onload = $4
    WHERE id = $5
    RETURNING ${columns}
      `,
      [finish, reminder, is_active, has_reminder_onload, id]
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
