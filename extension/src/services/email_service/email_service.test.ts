import { Subject, Template } from "common";

import { service } from "../service";
import { emailService } from "./email_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("emailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";

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
        template: Template.CONFIRM_ACCOUNT,
        subject: Subject.CONFIRM_ACCOUNT,
      };

      const response = await emailService.sendEmail({ userId, body });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/emails`,
        options: {
          body: JSON.stringify(body),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({ json: { info }, status });
    });
  });
});
