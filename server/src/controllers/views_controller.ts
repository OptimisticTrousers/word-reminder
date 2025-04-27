import { Template } from "common";
import { Request, Response } from "express";

import { variables } from "../config/variables";

const { SERVER_URL, SERVER_PORT } = variables;

export const change_password = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.CHANGE_PASSWORD}`, {
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

export const forgot_password = (req: Request, res: Response) => {
  const { userId, token } = req.params;

  res.render(`pages/${Template.FORGOT_PASSWORD}`, {
    userId,
    token,
    message: undefined,
  });
};

export const index = (req: Request, res: Response) => {
  res.render("pages/index");
};
