import { http, Templates, Subject } from "common";

import { service } from "../service";
import { emailService } from "./email_service";

vi.mock("common");

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
      const mockHttpPost = vi
        .spyOn(http, "post")
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

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/emails`,
        options: { body: JSON.stringify(body), credentials: "include" },
      });
      expect(response).toEqual({ json: { info }, status });
    });
  });
});
