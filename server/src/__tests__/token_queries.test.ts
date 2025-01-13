import { tokenQueries } from "../db/token_queries";
// Import db setup and teardown functionality
import "../db/test_populatedb";

describe("tokenQueries", () => {
  describe("create", () => {
    it("creates a token and saves it in the database", async () => {
      const token = await tokenQueries.create();

      const nowTimestamp = Date.now();
      // expires in 30 minutes
      const expiresAtTimestamp = new Date(
        nowTimestamp + 30 * 60 * 1000
      ).getTime();
      expect(token).toEqual({
        token: expect.any(String),
        expires_at: expect.any(Date),
      });
      expect(
        Math.abs(token.expires_at.getTime() - expiresAtTimestamp)
      ).toBeLessThan(1000);
    });
  });

  describe("verify", () => {
    it("returns a token when the token is valid", async () => {
      const token = await tokenQueries.create();

      const verified = await tokenQueries.verify(token.token);

      expect(verified).toBe(true);
    });

    it("returns a token when the token is invalid", async () => {
      const token = await tokenQueries.create();
      token.token = `${token}invalidtoken`;

      const verified = await tokenQueries.verify(token.token);

      expect(verified).toBe(false);
    });
  });

  describe("deleteAll", () => {
    it("deletes tokens", async () => {
      const token1 = await tokenQueries.create();
      const token2 = await tokenQueries.create();
      const token3 = await tokenQueries.create();
      const token4 = await tokenQueries.create();

      const tokens = [token1, token2, token3, token4];
      const deletedTokens = await tokenQueries.deleteAll(
        tokens.map((token) => {
          return token.token;
        })
      );
      expect(deletedTokens).toEqual(tokens);
    });
  });

  it("returns undefined when the token does not exist", async () => {
    // token expires 30 minutes from now
    const deletedTokens = await tokenQueries.deleteAll(["fakeToken"]);

    expect(deletedTokens).toEqual([]);
  });
});
