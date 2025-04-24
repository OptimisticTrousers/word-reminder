import { Router } from "express";

import { reset_database } from "../controllers/testing_controller";

export const testingRouter = Router({ caseSensitive: true });

testingRouter.route("/reset").delete(reset_database);
