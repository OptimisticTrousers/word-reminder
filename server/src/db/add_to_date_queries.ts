import { QueryResult } from "pg";
import { AddToDate, AddToDateParams } from "common";

import { createQueries } from "./queries";

export const addToDateQueries = (function () {
  const queries = createQueries<AddToDate>(["*"], "add_to_dates");
  const { columns, db, getById, deleteById, table } = queries;

  const create = async ({
    minutes,
    hours,
    days,
    weeks,
    months,
  }: AddToDateParams): Promise<AddToDate> => {
    const { rows }: QueryResult<AddToDate> = await db.query(
      `
    INSERT INTO ${table}(minutes, hours, days, weeks, months)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${columns};
      `,
      [minutes, hours, days, weeks, months]
    );

    return rows[0];
  };

  return {
    create,
    deleteById: deleteById.bind(queries),
    getById: getById.bind(queries),
  };
})();
