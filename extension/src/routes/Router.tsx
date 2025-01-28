import { useRoutes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "../components/ui/Loading";
import { Error500 } from "../pages/Error500";
import { sessionService } from "../services/session_service";
import { routes } from "./routes";

export function Router() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getCurrentUser,
  });

  const routing = useRoutes(routes(data?.json.user));

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error500 message={error.message} />;
  }

  return routing;
}
