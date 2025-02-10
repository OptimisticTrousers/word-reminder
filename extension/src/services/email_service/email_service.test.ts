import { Templates, Subject } from "common";

import { service } from "../service";
import { emailService } from "./email_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("emailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", async () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const info = {
        message:
          "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
      };
      const status = 200;
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return {
            json: { info },
            status,
          };
        });
      const body = {
        email: "bob@protonmail.com",
        template: Templates.EMAIL_VERIFICATION,
        subject: Subject.EMAIL_VERIFICATION,
      };

      const response = await emailService.sendEmail(body);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/emails`,
        options: { body: JSON.stringify(body), credentials: "include" },
      });
      expect(response).toEqual({ json: { info }, status });
    });
  });

  describe("verifyEmailCode", async () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const message = "Code has been verified";
      const status = 200;
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return {
            json: { message },
            status,
          };
        });
      const body = {
        token: "sometoken",
      };

      const response = await emailService.verifyEmailToken(body);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/emails`,
        options: { body: JSON.stringify(body), credentials: "include" },
      });
      expect(response).toEqual({
        json: { message },
        status,
      });
    });
  });
});
