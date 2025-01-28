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
  "FRONTEND_URL",
  "NODE_ENV",
  "SALT",
  "SECRET",
  "SERVER_PORT",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "PROTON_SMTP_USER",
  "PROTON_SMTP_TOKEN",
  "PROTON_SMTP_SERVER",
  "PROTON_SMTP_PORT",
  "SERVER_URL",
  "FRONTEND_VERIFICATION",
]) {
  if (!(variable in process.env)) {
    throw new Error(`${variable} is not defined in .env file.`);
  }
  variables[variable] = process.env[variable]!;
}
