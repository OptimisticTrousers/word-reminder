import { Client } from "pg";

export class Database {
  client: Client;

  constructor(connectionString: string) {
    this.client = new Client({
      connectionString,
    });
  }

  async initializeConnection() {
    await this.client.connect();
  }

  async populate() {
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
        username VARCHAR ( 255 ) UNIQUE NOT NULL,
        password VARCHAR ( 72 ) NOT NULL,
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
    `;

    // console.log("Seeding...");
    await this.client.query(SQL);
  }

  async clear() {
    const SQL = `
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      COMMENT ON SCHEMA public IS 'standard public schema';
    `;

    // console.log("Resetting database...");
    await this.client.query(SQL);
    // console.log("Successfully reset database.");
  }

  async stopConnection() {
    // console.log("Stopping database connection.");
    await this.client.end();
  }
}
