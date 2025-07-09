export function ErrorMessage({ message }: { message: string }) {
  return <div data-testid="error-message">{message}</div>;
}
