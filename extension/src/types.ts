export interface ErrorResponse extends Response {
  json: { message: string };
}

export interface Response {
  status: number;
}
