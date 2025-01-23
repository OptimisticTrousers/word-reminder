export interface User {
  id: string;
  email: string;
  confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWord {
  id: string;
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionParams {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export enum Templates {
  EMAIL_VERIFICATION = "email_verification",
  CHANGE_EMAIL_VERIFICATION = "change_email_verification",
  CHANGE_PASSWORD_VERIFICATION = "change_password_verification",
}

export enum Subject {
  EMAIL_VERIFICATION = "Verify Your Email",
  CHANGE_EMAIL_VERIFICATION = "Change Email",
  CHANGE_PASSWORD_VERIFICATION = "Change Password",
}
