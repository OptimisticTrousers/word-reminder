import { createQueries } from "./queries";

interface SubscriptionParams {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Subscription extends SubscriptionParams {
  id: string;
}

export const subscriptionQueries = (function () {
  const { columns, db, table } = createQueries(["*"], "subscriptions");

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

  const deleteById = async (id: string): Promise<Subscription> => {
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

  const get = async (): Promise<Subscription[]> => {
    const { rows } = await db.query(
      `
    SELECT ${columns} FROM ${table};
      `
    );

    return rows;
  };

  return { create, deleteById, get };
})();
