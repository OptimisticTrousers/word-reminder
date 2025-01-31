import { Templates } from "common";

import { service } from "../service";

interface SendEmailBody {
  email: string;
  subject: string;
  template: Templates;
}

interface VerifyEmailCodeBody {
  code: string;
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

  function verifyEmailCode(body: VerifyEmailCodeBody) {
    return post({
      url: `${VITE_API_DOMAIN}/emails`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
      },
    });
  }

  return { sendEmail, verifyEmailCode };
})(service);
