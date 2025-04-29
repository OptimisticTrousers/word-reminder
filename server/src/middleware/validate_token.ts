import asyncHandler from "express-async-handler";

import { tokenQueries } from "../db/token_queries";

export const validateToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const isValidToken = await tokenQueries.verify(token);


  if (!isValidToken) {
    res.redirect(303, "/failedVerification");
    return;
  }

  res.locals.token = token;

  next();
});
