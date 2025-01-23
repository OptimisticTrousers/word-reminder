import { useRoutes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "../components/ui";
import { Error500 } from "../pages/Error500";
import { sessionService } from "../services/session_service";
import { routes } from ".";

export const Router = function () {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getCurrentUser,
  });
  const isLoggedIn = data?.json.user !== undefined;

  const routing = useRoutes(routes(isLoggedIn));

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error500 message={error.message} />;
  }

  return routing;
};
