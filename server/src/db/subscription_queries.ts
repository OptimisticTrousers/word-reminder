import { SubscriptionParams } from "common";

import { createQueries } from "./queries";

export interface Subscription extends SubscriptionParams {
  id: string;
}

export const subscriptionQueries = (function () {
  const queries = createQueries<Subscription>(["*"], "subscriptions");
  const { columns, db, getById, deleteById, table } = queries;
  const create = async (
    subscription: SubscriptionParams
  ): Promise<Subscription> => {
    const { rows } = await db.query(
      `
    INSERT INTO ${table}(endpoint, p256dh, auth)
    VALUES ($1, $2, $3)
    RETURNING ${columns};
      `,
      [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

    return rows[0];
  };

  const get = async (): Promise<Subscription[]> => {
    const { rows } = await db.query(
      `
    SELECT ${columns} FROM ${table};
      `
    );

    return rows;
  };

  return {
    create,
    getById: getById.bind(queries),
    deleteById: deleteById.bind(queries),
    get,
  };
})();
