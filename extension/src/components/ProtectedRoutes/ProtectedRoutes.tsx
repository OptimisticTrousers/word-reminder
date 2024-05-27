import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Error500 } from "../../pages";
import Loading from "../Loading";
import useHttp from "../../hooks/useHttp";

const ProtectedRoutes = () => {
  const { get } = useHttp();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return get(`${import.meta.env.VITE_API_DOMAIN}/auth/current`);
    },
  });

  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error500 message={error.message} />;
  }

  console.log(user);

  return (
    <>
      {/* {(!location.pathname.includes("/signup") ||
        (!location.pathname.includes("/login") && user === null)) && (
        <Navigate replace={true} to="/login" />
      )} */}
      <Outlet />
    </>
  );
};

export default ProtectedRoutes;
