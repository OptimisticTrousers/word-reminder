import PgBoss from "pg-boss";

import { variables } from "../config/variables";

const { DATABASE_URL } = variables;

export const boss = new PgBoss(DATABASE_URL);

boss.on("error", console.error);
