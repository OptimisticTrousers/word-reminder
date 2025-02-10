import { Props } from "../Error500";

export function Error500({ message }: Props) {
  return <div data-testid="error-500">{message}</div>;
}
