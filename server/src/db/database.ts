import { Client } from "pg";

export class Database {
  client: Client;

  constructor(connectionString: string) {
    this.client = new Client({
      connectionString,
    });
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
        email VARCHAR ( 255 ) UNIQUE NOT NULL,
        password VARCHAR ( 72 ) NOT NULL,
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

    // console.log("Seeding...");
    await this.client.query(SQL);
  }

  async stopConnection() {
    // console.log("Stopping database connection.");
    await this.client.end();
  }
}
