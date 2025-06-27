import { ReactNode } from "react";
import CSSModules from "react-css-modules";

import { ErrorMessage } from "../ErrorMessage";
import { Loading } from "../Loading";
import { NoMore } from "../NoMore";
import styles from "./PaginatedList.module.css";

interface Page {
  page: number;
  limit: number;
}

export interface Props {
  name: string;
  totalRows: string;
  list: ReactNode[];
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  previous?: Page;
  next?: Page;
  setPagination: (limit: number, page: number) => void;
}

export const PaginatedList = CSSModules(
  function ({
    name,
    totalRows,
    list,
    isLoading,
    isSuccess,
    error,
    previous,
    next,
    setPagination,
  }: Props) {
    return (
      <div styleName="paginated">
        <h2 styleName="paginated__heading">
          {name[0].toUpperCase() + name.slice(1)}
        </h2>
        <p styleName="paginated__count">Count: {totalRows}</p>
        <ul styleName="paginated__list">
          {isSuccess && list.length === 0 ? <NoMore name={name} /> : list}
        </ul>
        {error && <ErrorMessage message={error.message} />}
        {isLoading && <Loading />}
        <div styleName="paginated__buttons">
          {previous && (
            <button
              styleName="paginated__button"
              onClick={() => {
                setPagination(previous.limit, previous.page);
              }}
            >
              Previous
            </button>
          )}
          {next && (
            <button
              styleName="paginated__button"
              onClick={() => {
                setPagination(next.limit, next.page);
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
