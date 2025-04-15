import { useRoutes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "../components/ui/Loading";
import { Error500 } from "../pages/Error500";
import { sessionService } from "../services/session_service";
import { routes } from "./routes";
import { ErrorResponse } from "../types";
import { useOnMessageRedirect } from "../hooks/useOnMessageNavigate";

export function Router() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => {
      return sessionService.getCurrentUser();
    },
  });
  useOnMessageRedirect();

  const user = data?.json.user;
  const routing = useRoutes(routes(user));

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error500 message={(error as unknown as ErrorResponse).json.message} />
    );
  }

  return routing;
}
