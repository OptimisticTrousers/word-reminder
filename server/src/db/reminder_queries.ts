import { QueryResult } from "pg";
import { AddToDate, Reminder } from "common";

import { createQueries } from "./queries";

export const reminderQueries = (function () {
  const queries = createQueries<Reminder>(["*"], "reminders");
  const { columns, db, getById, table } = queries;

  const create = async ({
    word_reminder_id,
    minutes,
    hours,
    days,
    weeks,
    months,
  }: AddToDate & { word_reminder_id: string }) => {
    const { rows }: QueryResult<Reminder> = await db.query(
      `
    INSERT INTO ${table}(minutes, hours, days, weeks, months, word_reminder_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${columns};
      `,
      [minutes, hours, days, weeks, months, word_reminder_id]
    );

    return rows[0];
  };

  const updateByWordReminderId = async (
    wordReminderId: string,
    { minutes, hours, days, weeks, months }: AddToDate
  ) => {
    const { rows }: QueryResult<Reminder> = await db.query(
      `
    UPDATE ${table}
    SET minutes = $1, hours = $2, days = $3, weeks = $4, months = $5
    WHERE word_reminder_id = $6
    RETURNING ${columns};
      `,
      [minutes, hours, days, weeks, months, wordReminderId]
    );

    return rows[0];
  };

  const deleteByWordReminderId = async (wordReminderId: string) => {
    const { rows }: QueryResult<Reminder> = await db.query(
      `
    DELETE FROM ${table}
    WHERE word_reminder_id = $1
    RETURNING ${columns};
      `,
      [wordReminderId]
    );

    return rows[0];
  };

  const deleteAllByUserId = async (userId: string) => {
    const { rows }: QueryResult<Reminder> = await db.query(
      `
    DELETE FROM ${table}
    WHERE word_reminder_id IN (
      SELECT id
      FROM word_reminders
      WHERE user_id = $1
    )
    RETURNING ${columns};
    `,
      [userId]
    );

    return rows;
  };

  return {
    create,
    updateByWordReminderId,
    deleteByWordReminderId,
    deleteAllByUserId,
    getById: getById.bind(queries),
  };
})();
