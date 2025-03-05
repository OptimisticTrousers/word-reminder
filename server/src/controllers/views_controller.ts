import { Template } from "common";
import { Request, Response } from "express";

export const change_password = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CHANGE_PASSWORD}`, {
    userId,
    token,
    message: undefined
  });
};

export const change_email = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CHANGE_EMAIL}`, {
    userId,
    token,
    message: undefined
  });
};

export const failed_verification = (req: Request, res: Response) => {
  res.render("pages/failed_verification");
};

export const forgot_password = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.FORGOT_PASSWORD}`, {
    userId,
    token,
    message: undefined
  });
};

export const index = (req: Request, res: Response) => {
  res.render("pages/index");
};
