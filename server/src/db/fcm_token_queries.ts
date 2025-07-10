import { QueryResult } from "pg";
import { createQueries } from "./queries";
import { FCMToken } from "common";

export const fcmTokenQueries = (function () {
  const { columns, db, table } = createQueries<FCMToken>(["*"], "fcm_tokens");

  const create = async ({
    token,
    userId,
  }: {
    token: string;
    userId: number;
  }): Promise<FCMToken> => {
    const { rows }: QueryResult<FCMToken> = await db.query(
      `
    INSERT INTO ${table}(token, user_id)
    VALUES ($1, $2)
    RETURNING ${columns};
      `,
      [token, userId]
    );

    return rows[0];
  };

  const getByUserId = async (userId: number): Promise<FCMToken[]> => {
    const { rows }: QueryResult<FCMToken> = await db.query(
      `
    SELECT ${columns}
    FROM ${table}
    WHERE user_id = $1;
      `,
      [userId]
    );

    return rows;
  };

  return { create, getByUserId };
})();
