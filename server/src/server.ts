import { app } from "./app";
import { variables } from "./config/variables";

const port = Number(variables.SERVER_PORT) || 5000;

app.listen(port, () => console.log("Server running..."));
