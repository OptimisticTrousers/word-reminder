import { app } from "./app";
import { variables } from "./config/variables";
import { boss } from "./db/boss";
import { notFoundHandler } from "./middleware/not_found_handler";

const port = Number(variables.PORT) || 5000;

// Add the 'notFoundHandler' middleware in 'server.ts' instead of 'app.ts' to fix a bug where using this Express application in a test would cause a 'NotFoundError:' for any new test routes.
app.use(notFoundHandler);

boss.start().catch((error: unknown) => {
  console.error(error);
});

app.listen(port, "0.0.0.0", () => console.log("Server running..."));
