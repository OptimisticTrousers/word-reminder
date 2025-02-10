import { service } from "../service";

interface SendEmailBody {
  email: string;
  subject: string;
  template: string;
}

interface VerifyEmailTokenBody {
  token: string | undefined;
}

export const emailService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function sendEmail(body: SendEmailBody) {
    return post({
      url: `${VITE_API_DOMAIN}/emails`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
      },
    });
  }

  function verifyEmailToken(body: VerifyEmailTokenBody) {
    return post({
      url: `${VITE_API_DOMAIN}/emails`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
      },
    });
  }

  return { sendEmail, verifyEmailToken };
})(service);
