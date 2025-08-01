import { Client } from "pg";

import { createPopulateDb } from "./";
import { variables } from "../config/variables";

const { DATABASE_URL } = variables;

// Deleting all of the documents in each collection in the database for the real Mongo database
void (async () => {
  try {
    const database = createPopulateDb(
      new Client({ connectionString: DATABASE_URL })
    );
    await database.initializeConnection();
    console.log("Resetting database...");
    await database.clear();
    console.log("Successfully reset database.");
    console.log("Seeding...");
    await database.populate();
    console.log("Successfully populated database.");
    console.log("Stopping database connection.");
    await database.stopConnection();
  } catch (err) {
    const SPLIT_DATABASE_URL: string[] = DATABASE_URL.split("/");
    const DATABASE_NAME: string =
      SPLIT_DATABASE_URL[SPLIT_DATABASE_URL.length - 1];
    console.error(
      `An error occurred while deleting all of the tables in the ${DATABASE_NAME} database: ${err}.`
    );
  }
})();
