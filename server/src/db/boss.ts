import PgBoss from "pg-boss";

import { variables } from "../config/variables";

const { DATABASE_URL, NODE_ENV, TEST_DATABASE_URL } = variables;

export const boss = new PgBoss(
  NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL
);

boss.on("error", console.error);
