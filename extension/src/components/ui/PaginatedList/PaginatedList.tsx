import { ReactNode } from "react";
import CSSModules from "react-css-modules";
import { Link } from "react-router-dom";

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
  }: Props) {
    return (
      <div styleName="paginated">
        <h2 styleName="paginated__heading">
          {name[0].toUpperCase() + name.slice(1)}
        </h2>
        <p styleName="paginated__count">{totalRows}</p>
        <ul styleName="paginated__list">
          {isSuccess && list.length === 0 ? <NoMore name={name} /> : list}
        </ul>
        {error && <ErrorMessage message={error.message} />}
        {isLoading && <Loading />}
        {previous && (
          <Link
            styleName="paginated__link"
            to={`/words?limit=${previous.limit}&page=${previous.page}`}
          >
            Previous
          </Link>
        )}
        {next && (
          <Link
            styleName="paginated__link"
            to={`/words?limit=${next.limit}&page=${next.page}`}
          >
            Next
          </Link>
        )}
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
