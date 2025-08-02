import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "..", "..", ".env.local") });

interface Variables {
  [key: string]: string;
}

export const variables: Variables = {};

for (const variable of [
  "DATABASE_URL",
  "TEST_DATABASE_URL",
  "NODE_ENV",
  "SALT",
  "SECRET",
  "PORT",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "WORD_REMINDER_EMAIL",
  "SERVER_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
]) {
  if (!(variable in process.env)) {
    throw new Error(`${variable} is not defined in .env file.`);
  }
  variables[variable] = process.env[variable]!;
}
