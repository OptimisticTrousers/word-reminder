import { Subscription } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const subscriptionQueries = (function () {
  const queries = createQueries<Subscription>(["*"], "subscriptions");
  const { columns, db, getById, deleteById, table } = queries;

  const create = async ({
    userId,
    subscription: { endpoint, keys },
  }: {
    userId: number;
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
  }) => {
    const { rows }: QueryResult<Subscription> = await db.query(
      `
    INSERT INTO ${table}(endpoint, p256dh, auth, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING ${columns};
      `,
      [endpoint, keys.p256dh, keys.auth, userId]
    );

    return rows[0];
  };

  const deleteByUserId = async (userId: number) => {
    const { rows }: QueryResult<Subscription> = await db.query(
      `
    DELETE FROM ${table}
    WHERE user_id = $1
    RETURNING ${columns};
      `,
      [userId]
    );

    return rows[0];
  };

  const getByUserId = async (userId: number) => {
    const { rows }: QueryResult<Subscription> = await db.query(
      `
    SELECT ${columns} FROM ${table}
    WHERE user_id = $1;
      `,
      [userId]
    );

    return rows[0];
  };

  return {
    create,
    deleteByUserId,
    deleteById: deleteById.bind(queries),
    getById: getById.bind(queries),
    getByUserId,
  };
})();
