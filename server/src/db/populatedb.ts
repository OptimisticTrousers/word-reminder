// Importing file that populates mock data for the database
import { Database } from "./database";
import { variables } from "../config/variables";

// Deleting all of the documents in each collection in the database for the real Mongo database
(async () => {
  try {
    const database = new Database(variables.DATABASE_URL);
    await database.initializeConnection();
    await database.clear();
    console.log("Resetting database...");
    await database.populate();
    console.log("Successfully reset database.");
    await database.stopConnection();
  } catch (err) {
    const SPLIT_DATABASE_URL: string[] = variables.DATABASE_URL.split("/");
    const DATABASE_NAME: string =
      SPLIT_DATABASE_URL[SPLIT_DATABASE_URL.length - 1];
    console.error(
      `An error occurred while deleting all of the tables in the ${DATABASE_NAME} database: ${err}.`
    );
  }
})();
