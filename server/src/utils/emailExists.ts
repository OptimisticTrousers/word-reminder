import { UserQueries } from "../db/userQueries";

export const emailExists = async (value: string): Promise<boolean> => {
  const userQueries = new UserQueries();
  const user = await userQueries.getByEmail(value);
  if (user) {
    const error: Error & { status?: number } = new Error(
      "E-mail already in use."
    );
    error.status = 400;
    throw error;
  }
  return true;
};
