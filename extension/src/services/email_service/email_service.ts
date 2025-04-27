import { Subject, Template } from "common";

import { service } from "../service";

interface SendEmailBody {
  email: string;
  subject: Subject;
  template: Template;
}

export const emailService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function sendEmail({
    userId,
    body,
  }: {
    userId: string | undefined;
    body: SendEmailBody;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/emails`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      },
    });
  }

  return { sendEmail };
})(service);
