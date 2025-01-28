import { Templates } from "common";

import { service } from "../service";

interface Body {
  email: string;
  subject: string;
  template: Templates;
}

export const emailService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function sendEmail(body: Body) {
    return post({
      url: `${VITE_API_DOMAIN}/emails`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
      },
    });
  }

  return { sendEmail };
})(service);
