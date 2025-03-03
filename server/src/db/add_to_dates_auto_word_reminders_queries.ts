import { QueryResult } from "pg";
import { createQueries } from "./queries";
import {
  AddToDate,
  AddToDateParams,
  AddToDatesAutoWordReminder,
  AddToDatesAutoWordReminderDbParams,
} from "common";

export const addToDatesAutoWordRemindersQueries = (function () {
  const prefixTable = "add_to_dates";
  const tableName = `${prefixTable}_auto_word_reminders`;
  const queries = createQueries<AddToDatesAutoWordReminder>(
    [
      `${tableName}.id`,
      `${tableName}.auto_word_reminder_id`,
      `${tableName}.reminder_id`,
      `${tableName}.duration_id`,
    ],
    tableName
  );
  const { columns, db, getById, table } = queries;

  const create = async ({
    auto_word_reminder_id,
    reminder_id,
    duration_id,
  }: AddToDatesAutoWordReminderDbParams) => {
    const { rows }: QueryResult<AddToDatesAutoWordReminder> = await db.query(
      `
    INSERT INTO ${table}(auto_word_reminder_id, reminder_id, duration_id)
    VALUES ($1, $2, $3)
    RETURNING ${columns};
      `,
      [auto_word_reminder_id, reminder_id, duration_id]
    );

    return rows[0];
  };

  const updateByAutoWordReminderId = async (
    autoWordReminderId: string,
    {
      reminder,
      duration,
    }: { reminder: AddToDateParams; duration: AddToDateParams }
  ) => {
    const { rows: reminderRows }: QueryResult<AddToDate> = await db.query(
      `
    UPDATE ${prefixTable}
    SET minutes = $1, hours = $2, days = $3, weeks = $4, months = $5
    FROM ${prefixTable} as atd
    JOIN ${table}
    ON ${table}.reminder_id = atd.id
    WHERE ${table}.auto_word_reminder_id = $6
    RETURNING ${columns};
      `,
      [
        reminder.minutes,
        reminder.hours,
        reminder.days,
        reminder.weeks,
        reminder.months,
        autoWordReminderId,
      ]
    );

    const { rows: durationRows }: QueryResult<AddToDate> = await db.query(
      `
    UPDATE ${prefixTable}
    SET minutes = $1, hours = $2, days = $3, weeks = $4, months = $5
    FROM ${prefixTable} as atd
    JOIN ${table}
    ON ${table}.duration_id = atd.id
    WHERE ${table}.auto_word_reminder_id = $6
    RETURNING ${columns};
      `,
      [
        duration.minutes,
        duration.hours,
        duration.days,
        duration.weeks,
        duration.months,
        autoWordReminderId,
      ]
    );

    return [durationRows[0], reminderRows[0]];
  };

  const getByAutoWordReminderId = async (
    autoWordReminderId: string
  ): Promise<AddToDatesAutoWordReminder> => {
    const { rows }: QueryResult<AddToDatesAutoWordReminder> = await db.query(
      `
    SELECT ${columns} 
    FROM ${table}
    WHERE auto_word_reminder_id = $1;
      `,
      [autoWordReminderId]
    );

    return rows[0];
  };

  const deleteByAutoWordReminderId = async (
    autoWordReminderId: string
  ): Promise<AddToDatesAutoWordReminder> => {
    const { rows }: QueryResult<AddToDatesAutoWordReminder> = await db.query(
      `
      DELETE FROM ${table}
      WHERE auto_word_reminder_id = $1
      RETURNING ${columns}
        `,
      [autoWordReminderId]
    );

    return rows[0];
  };

  return {
    create,
    updateByAutoWordReminderId,
    deleteByAutoWordReminderId,
    getByAutoWordReminderId,
    getById: getById.bind(queries),
  };
})();
