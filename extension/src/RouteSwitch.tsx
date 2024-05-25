import { createMemoryRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import App from "./App";
import { Words, Login, WordsByDurations, Register } from "./pages";
import { useQuery } from "@tanstack/react-query";

const RouteSwitch = () => {

    const { data: user, isPending, error } = useQuery({
        queryKey: ["user"], queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_DOMAIN}/users/fetch-current-user`);
            return await res.json();
        }
    })

    if (isPending) {
        return (
            <div>This is pending</div>
        )
    }

    if (error) {
        return (
            <div>This is an error</div>
        )
    }

    const router = createMemoryRouter(createRoutesFromElements(
        <Route path="/" element={!user ? <Navigate to="/login" /> : <App />}>
            <Route index element={<Words />} />
            <Route path="login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="wordsByDurations" element={<WordsByDurations />} />
        </Route >
    ))

    return (
        <RouterProvider router={router} />
    )
}

export default RouteSwitch;