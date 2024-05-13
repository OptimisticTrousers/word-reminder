function throwError(object: unknown, message: string) {
  if (!object) {
    throw new Error(message);
  }
}

export default throwError;
