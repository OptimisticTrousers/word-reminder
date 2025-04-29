import { Template } from "common";
import { Request, Response } from "express";

export const change_password = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CHANGE_PASSWORD}`, {
    title: "Change Password",
    userId,
    token,
    message: undefined,
  });
};

export const confirm_account = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CONFIRM_ACCOUNT}`, {
    userId,
    token,
  });
};

export const change_email = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CHANGE_EMAIL}`, {
    userId,
    token,
    message: undefined,
  });
};

export const failed_verification = (req: Request, res: Response) => {
  res.render("pages/failed_verification");
};

export const index = (req: Request, res: Response) => {
  res.render("pages/index");
};
