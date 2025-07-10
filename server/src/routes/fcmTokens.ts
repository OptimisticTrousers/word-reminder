import { Router } from "express";
import { create_fcm_token } from "../controllers/fcm_token_controller";

export const fcmTokenRouter = Router({
  caseSensitive: true,
  mergeParams: true,
});

fcmTokenRouter.route("/").post(create_fcm_token);
