import { app } from "./app";
import { variables } from "./config/variables";
import { notFoundHandler } from "./middleware/notFoundHandler";

const port = Number(variables.SERVER_PORT) || 5000;

// Add the 'notFoundHandler' middleware to fix a bug where using this Express application in a test would cause a 'NotFoundError:' for any new routes
app.use(notFoundHandler);

app.listen(port, () => console.log("Server running..."));
