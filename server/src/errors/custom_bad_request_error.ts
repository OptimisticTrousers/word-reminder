export class CustomBadRequestError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 400;
    // So the error is neat when stringified. BadRequestError: message instead of Error: message
    this.name = "BadRequestError";
  }
}
