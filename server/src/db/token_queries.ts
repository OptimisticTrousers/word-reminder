import crypto from "crypto";
import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface Token {
  token: string;
  expires_at: Date;
}

export class TokenQueries extends Queries<Token> {
  constructor() {
    super(["*"], "tokens");
  }

  async create() {
    const token = crypto.randomBytes(16).toString("hex");
    const { rows }: QueryResult<Token> = await this.pool.query(
      `
    INSERT INTO ${this.table}(token)
    VALUES ($1)
    RETURNING ${this.columns};
      `,
      [token]
    );

    return rows[0];
  }

  async deleteAll(tokens: string[]): Promise<Token[]> {
    const { rows }: QueryResult<Token> = await this.pool.query(
      `
    DELETE
    FROM ${this.table}
    WHERE token = ANY($1)
    RETURNING ${this.columns};
      `,
      [tokens]
    );

    return rows;
  }

  async verify(token: string) {
    const { rows }: QueryResult<{ token_exists: boolean }> =
      await this.pool.query(
        `
    SELECT EXISTS (
      SELECT 1
      FROM tokens
      WHERE token = $1
    ) AS token_exists;
      `,
        [token]
      );

    const tokenExists = rows[0].token_exists;
    return tokenExists;
  }
}
