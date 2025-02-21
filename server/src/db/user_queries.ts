import { QueryResult } from "pg";
import { User } from "common";

import { createQueries } from "./queries";

export const userQueries = (function () {
  const queries = createQueries<User>(
    ["id", "auto", "email", "confirmed", "created_at", "updated_at"],
    "users"
  );
  const { columns, db, getById, table } = queries;

  const create = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | null> => {
    const existingUser = await getByEmail(email);

    if (existingUser) {
      return null;
    }

    const { rows }: QueryResult<User> = await db.query(
      `
    INSERT INTO ${table}(email, password)
    VALUES ($1, $2)
    RETURNING ${columns};
      `,
      [email, password]
    );

    return rows[0];
  };

  const deleteById = async (id: string): Promise<User> => {
    const { rows }: QueryResult<User> = await db.query(
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

  const get = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | undefined> => {
    const { rows }: QueryResult<User> = await db.query(
      `
    SELECT ${columns}
    FROM users
    WHERE email = $1 AND password = $2;
      `,
      [email, password]
    );

    return rows[0];
  };

  const getByEmail = async (email: string): Promise<User | undefined> => {
    const { rows }: QueryResult<User> = await db.query(
      `
    SELECT ${columns}
    FROM users
    WHERE email = $1;
      `,
      [email]
    );

    return rows[0];
  };

  const updateById = async (
    id: string,
    {
      confirmed,
      email,
      password,
    }:
      | { confirmed: boolean; email?: undefined; password?: undefined }
      | { confirmed?: undefined; email: string; password?: undefined }
      | { confirmed?: undefined; email?: undefined; password: string }
  ): Promise<User> => {
    let setClause = "";
    const values = [];

    if (confirmed) {
      setClause = "confirmed = $1";
      values.push(confirmed);
    } else if (email) {
      setClause = "email = $1";
      values.push(email);
    } else if (password) {
      setClause = "password = $1";
      values.push(password);
    }
    values.push(id);

    const { rows }: QueryResult<User> = await db.query(
      `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $2
    RETURNING ${columns};
      `,
      values
    );

    return rows[0];
  };

  return {
    create,
    deleteById,
    get,
    getById: getById.bind(queries),
    getByEmail,
    updateById,
  };
})();

export const EMAIL_MAX = 255;
export const PASSWORD_MAX = 72;
