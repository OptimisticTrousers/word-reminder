import { Props } from "../WordReminder";

export function WordReminder(props: Props) {
  return <div data-testid="word-reminder">{JSON.stringify(props)}</div>;
}
