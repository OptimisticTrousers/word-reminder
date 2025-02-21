import connectPgSimple, { PGStore } from "connect-pg-simple";
import session from "express-session";
import { Client, Pool, QueryResult } from "pg";

import { variables } from "../config/variables";

const { DATABASE_URL, TEST_DATABASE_URL, NODE_ENV } = variables;

export interface Db {
  stopConnection: () => Promise<void>;
  query: (text: string, values?: unknown[]) => Promise<QueryResult<any>>;
}

const pool = new Pool({
  connectionString: NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL,
});

const pgSession: typeof PGStore = connectPgSimple(session);

export const sessionStore: PGStore = new pgSession({
  pool,
  tableName: "session",
});

export const db: Db = (function (pool: Pool) {
  const query = async (
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<any>> => {
    return pool.query(text, values);
  };

  const stopConnection = async (): Promise<void> => {
    await pool.end();
  };

  return { query, stopConnection };
})(pool);

export const createPopulateDb = function (client: Client) {
  const clear = async () => {
    const SQL = `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      COMMENT ON SCHEMA public IS 'standard public schema';
    `;

    await client.query(SQL);
  };

  const initializeConnection = async () => {
    await client.connect();
  };

  const populate = async () => {
    const SQL = `
      CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);

      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

      CREATE INDEX "IDX_session_expire" ON "session" ("expire");

      CREATE TABLE users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        email VARCHAR ( 255 ) UNIQUE NOT NULL,
        password VARCHAR ( 72 ) NOT NULL,
        auto BOOLEAN NOT NULL DEFAULT FALSE,
        confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE words (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        details JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE user_words (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        word_id INTEGER REFERENCES words(id) NOT NULL,
        learned BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE word_reminders (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        reminder TEXT NOT NULL,
        is_active BOOLEAN NOT NULL,
        has_reminder_onload BOOLEAN NOT NULL,
        finish TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE user_words_word_reminders (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_word_id INTEGER REFERENCES user_words(id) NOT NULL,
        word_reminder_id INTEGER REFERENCES word_reminders(id) NOT NULL 
      );

      CREATE TABLE subscriptions (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT UNIQUE NOT NULL,
        auth TEXT UNIQUE NOT NULL
      );

      CREATE TABLE tokens (
        token TEXT PRIMARY KEY ,
        expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes')
      );

      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE TRIGGER set_timestamp
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

      CREATE OR REPLACE TRIGGER set_timestamp
      BEFORE UPDATE ON user_words
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();

      CREATE OR REPLACE TRIGGER set_timestamp
      BEFORE UPDATE ON word_reminders
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `;

    await client.query(SQL);
  };

  const stopConnection = async () => {
    await client.end();
  };

  return { clear, initializeConnection, populate, stopConnection };
};
