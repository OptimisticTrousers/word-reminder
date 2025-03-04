import { userQueries } from "../db/user_queries";
import { CustomBadRequestError } from "../errors/custom_bad_request_error";

export const emailDoesNotExist = async (value: string) => {
  const user = await userQueries.getByEmail(value);
  if (user) {
    throw new CustomBadRequestError("E-mail already in use.");
  }
  return true;
};
