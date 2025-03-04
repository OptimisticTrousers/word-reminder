import { userQueries } from "../db/user_queries";
import { emailDoesNotExist } from "../utils/email_does_not_exist";

const user = {
  id: 1,
  confirmed: false,
  email: "email",
  created_at: new Date(),
  updated_at: new Date(),
};

describe("emailDoesNotExist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error when the email is already in use", async () => {
    const mockGetByEmail = jest
      .spyOn(userQueries, "getByEmail")
      .mockResolvedValue(user);

    await expect(emailDoesNotExist(user.email)).rejects.toThrow(
      "E-mail already in use."
    );

    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
  });

  it("returns true when the email is not already in use", async () => {
    const mockGetByEmail = jest
      .spyOn(userQueries, "getByEmail")
      .mockResolvedValue(undefined);

    const exists = await emailDoesNotExist(user.email);

    expect(exists).toBe(true);
    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
  });
});
