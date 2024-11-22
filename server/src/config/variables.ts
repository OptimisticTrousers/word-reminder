import { config } from "dotenv";

config();

interface Variables {
  [key: string]: string;
}

export const variables: Variables = {};

for (const variable of [
  "DATABASE_URL",
  "TEST_DATABASE_URL",
  "FRONTEND_URL",
  "NODE_ENV",
  "SALT",
  "SECRET",
  "SERVER_PORT",
]) {
  if (!(variable in process.env)) {
    throw new Error(`${variable} is not defined in .env file.`);
  }
  variables[variable] = process.env[variable]!;
}
