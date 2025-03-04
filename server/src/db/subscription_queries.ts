import { Subscription } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const subscriptionQueries = (function () {
  const queries = createQueries<Subscription>(["*"], "subscriptions");
  const { columns, db, getById, deleteById, table } = queries;

  const create = async ({
    endpoint,
    keys,
  }: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }) => {
    const { rows }: QueryResult<Subscription> = await db.query(
      `
    INSERT INTO ${table}(endpoint, p256dh, auth)
    VALUES ($1, $2, $3)
    RETURNING ${columns};
      `,
      [endpoint, keys.p256dh, keys.auth]
    );

    return rows[0];
  };

  const get = async () => {
    const { rows }: QueryResult<Subscription> = await db.query(
      `
    SELECT ${columns} FROM ${table};
      `
    );

    return rows;
  };

  return {
    create,
    get,
    getById: getById.bind(queries),
    deleteById: deleteById.bind(queries),
  };
})();
