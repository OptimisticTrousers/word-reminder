import { QueryResult } from "pg";
import { createQueries } from "./queries";
import {
  AddToDateParams,
  AddToDatesWordReminder,
  AddToDatesWordReminderDbParams,
} from "common";

export const addToDatesWordRemindersQueries = (function () {
  const prefixTable = "add_to_dates";
  const tableName = `${prefixTable}_word_reminders`;
  const queries = createQueries<AddToDatesWordReminder>(
    [
      `${tableName}.id`,
      `${tableName}.word_reminder_id`,
      `${tableName}.reminder_id`,
    ],
    tableName
  );
  const { columns, db, getById, table } = queries;

  const create = async ({
    word_reminder_id,
    reminder_id,
  }: AddToDatesWordReminderDbParams): Promise<AddToDatesWordReminder> => {
    const { rows }: QueryResult<AddToDatesWordReminder> = await db.query(
      `
    INSERT INTO ${table}(word_reminder_id, reminder_id)
    VALUES ($1, $2)
    RETURNING ${columns};
      `,
      [word_reminder_id, reminder_id]
    );

    return rows[0];
  };

  const deleteAllByUserId = async (
    userId: string
  ): Promise<AddToDatesWordReminder[]> => {
    const { rows }: QueryResult<AddToDatesWordReminder> = await db.query(
      `
    DELETE FROM ${table}
    USING word_reminders
    WHERE word_reminders.id = ${table}.word_reminder_id 
    AND word_reminders.user_id = $1
    RETURNING ${columns};
      `,
      [userId]
    );

    return rows;
  };

  const updateByWordReminderId = async (
    wordReminderId: string,
    reminder: AddToDateParams
  ): Promise<AddToDatesWordReminder> => {
    const { rows }: QueryResult<AddToDatesWordReminder> = await db.query(
      `
    UPDATE ${prefixTable}
    SET minutes = $1, hours = $2, days = $3, weeks = $4, months = $5
    FROM ${prefixTable} as atd
    JOIN ${table}
    ON ${table}.reminder_id = atd.id
    WHERE ${table}.word_reminder_id = $6
    RETURNING ${columns};
      `,
      [
        reminder.minutes,
        reminder.hours,
        reminder.days,
        reminder.weeks,
        reminder.months,
        wordReminderId,
      ]
    );

    return rows[0];
  };

  const getByWordReminderId = async (
    wordReminderId: string
  ): Promise<AddToDatesWordReminder> => {
    const { rows }: QueryResult<AddToDatesWordReminder> = await db.query(
      `
    SELECT ${columns} 
    FROM ${table}
    WHERE word_reminder_id = $1;
      `,
      [wordReminderId]
    );

    return rows[0];
  };

  const deleteByWordReminderId = async (
    wordReminderId: string
  ): Promise<AddToDatesWordReminder> => {
    const { rows }: QueryResult<AddToDatesWordReminder> = await db.query(
      `
    DELETE FROM ${table}
    WHERE word_reminder_id = $1
    RETURNING ${columns};
      `,
      [wordReminderId]
    );

    return rows[0];
  };

  return {
    create,
    updateByWordReminderId,
    getByWordReminderId,
    deleteByWordReminderId,
    deleteAllByUserId,
    getById: getById.bind(queries),
  };
})();
