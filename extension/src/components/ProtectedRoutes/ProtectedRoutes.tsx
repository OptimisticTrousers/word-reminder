import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import useHttp from "../../hooks/useHttp";
import Loading from "../Loading";
import { Error500 } from "../../pages";

const ProtectedRoutes = () => {
  const { get } = useHttp();
  const { data, status, error } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return get(`${import.meta.env.VITE_API_DOMAIN}/auth/current`);
    },
  });

  if (status === "pending") {
    return <Loading />;
  }

  if (status === "error") {
    return <Error500 message={error.message} />;
  }

  console.log(data);

  return data ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
