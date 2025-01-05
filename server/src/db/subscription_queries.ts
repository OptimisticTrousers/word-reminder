import { QueryResult } from "pg";

import { Queries } from "./queries";

interface SubscriptionParams {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Subscription extends SubscriptionParams {
  id: number;
}

export class SubscriptionQueries extends Queries<Subscription> {
  constructor() {
    super(["*"], "subscriptions");
  }

  async create(subscription: SubscriptionParams): Promise<Subscription> {
    const { rows }: QueryResult<Subscription> = await this.pool.query(
      `
    INSERT INTO ${this.table}(endpoint, p256dh, auth)
    VALUES ($1, $2, $3)
    RETURNING ${this.columns};
      `,
      [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

    return rows[0];
  }

  async deleteById(id: number): Promise<Subscription> {
    const { rows } = await this.pool.query(
      `
    DELETE
    FROM ${this.table}
    WHERE id = $1
    RETURNING ${this.columns};
      `,
      [id]
    );

    return rows[0];
  }

  async get(): Promise<Subscription[]> {
    const { rows } = await this.pool.query(
      `
    SELECT ${this.columns} FROM ${this.table};
      `
    );

    return rows;
  }
}
