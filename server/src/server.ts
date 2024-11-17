import { app } from "./app";
import { variables } from "./utils/variables";

const port = variables.SERVER_PORT || 5000;

app.listen(port, () => console.log("Server running..."));
