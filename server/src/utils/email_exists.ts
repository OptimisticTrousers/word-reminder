import { UserQueries } from "../db/user_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";

export const emailExists = async (value: string): Promise<boolean> => {
  const userQueries = new UserQueries();
  const user = await userQueries.getByEmail(value);
  if (user) {
    throw new CustomBadRequestError("E-mail already in use.");
  }
  return true;
};
