import { User } from "common";

import { Response } from "../../types";

export interface SuccessResponse extends Response {
  json: { user: User };
}
