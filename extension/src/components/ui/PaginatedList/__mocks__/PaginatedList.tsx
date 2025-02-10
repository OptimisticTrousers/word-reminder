import { Props } from "../PaginatedList";

export function PaginatedList(props: Props) {
  return <div data-testid="paginated-list">{String(props)}</div>;
}
