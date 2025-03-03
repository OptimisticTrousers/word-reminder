import asyncHandler from "express-async-handler";

export const change_email = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  res.render("pages/change_email", {
    userId,
  });
});

export const change_password = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  res.render("pages/change_password", {
    userId,
  });
});

export const failed_verification = asyncHandler(async (req, res, next) => {
  res.render("pages/failed_verification");
});

export const forgot_password = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  res.render("pages/forgot_password", {
    userId,
  });
});

export const index = asyncHandler(async (req, res, next) => {
  res.render("pages/index");
});
