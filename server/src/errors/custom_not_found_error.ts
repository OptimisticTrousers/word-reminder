export class CustomNotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 404;
    // So the error is neat when stringified. NotFoundError: message instead of Error: message
    this.name = "NotFoundError";
  }
}
