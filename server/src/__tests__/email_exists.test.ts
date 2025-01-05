import { UserQueries } from "../db/user_queries";
import { emailExists } from "../utils/email_exists";

describe("emailExists", () => {
  const user = {
    id: "1",
    confirmed: false,
    email: "email",
    password: "password",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error when the email is already in use", async () => {
    const mockGetByEmail = jest
      .spyOn(UserQueries.prototype, "getByEmail")
      .mockResolvedValue(user)
      .mockName("getByName");
    await expect(emailExists(user.email)).rejects.toThrow(
      "E-mail already in use."
    );
    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
  });

  it("returns true when the email is not already in use", async () => {
    const mockGetByEmail = jest
      .spyOn(UserQueries.prototype, "getByEmail")
      .mockResolvedValue(undefined)
      .mockName("getByName");
    const exists = await emailExists(user.email);

    expect(exists).toBe(true);
    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
  });
});
