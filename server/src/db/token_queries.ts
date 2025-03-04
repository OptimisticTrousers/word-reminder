import { Token, TOKEN_MAX_BYTES } from "common";
import crypto from "crypto";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export const tokenQueries = (function () {
  const { columns, db, table } = createQueries<Token>(["*"], "tokens");

  const create = async () => {
    const token = crypto.randomBytes(TOKEN_MAX_BYTES).toString("hex");
    const { rows }: QueryResult<Token> = await db.query(
      `
    INSERT INTO ${table}(token)
    VALUES ($1)
    RETURNING ${columns};
      `,
      [token]
    );

    return rows[0];
  };

  const deleteAll = async (tokens: string[]) => {
    const { rows }: QueryResult<Token> = await db.query(
      `
    DELETE
    FROM ${table}
    WHERE token = ANY($1)
    RETURNING ${columns};
      `,
      [tokens]
    );

    return rows;
  };

  const verify = async (token: string) => {
    const { rows }: QueryResult<{ token_exists: boolean }> = await db.query(
      `
    SELECT EXISTS (
      SELECT 1
      FROM ${table}
      WHERE token = $1
    ) AS token_exists;
      `,
      [token]
    );

    const tokenExists = rows[0].token_exists;
    return tokenExists;
  };

  return { create, deleteAll, verify };
})();
