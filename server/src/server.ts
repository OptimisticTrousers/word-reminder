import { app } from "./app";
import { variables } from "./config/variables";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { scheduler } from "./utils/scheduler";

const port = Number(variables.SERVER_PORT) || 5000;

// Add the 'notFoundHandler' middleware in 'server.ts' instead of 'app.ts' to fix a bug where using this Express application in a test would cause a 'NotFoundError:' for any new test routes
app.use(notFoundHandler);

(async () => {
  await scheduler.start();
})();

app.listen(port, () => console.log("Server running..."));
