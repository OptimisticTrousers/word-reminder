export interface ErrorResponse extends Response {
  json:
    | { message: string }
    | {
        errors: {
          location: string;
          msg: string;
          path: string;
          type: string;
          value: string;
        }[];
      };
}

export interface Response {
  status: number;
}
