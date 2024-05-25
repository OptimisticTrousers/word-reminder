// import { useMutation } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const useAuth = () => {
//     const navigate = useNavigate();
//     // const [isAuthenticated, setIsAuthenticated] = useState(false);

//     // const {data, status, error, mutuate} = useMutation({mutationFn: () => {
//     //     return fetch(`${import.meta.env.VITE_API_DOMAIN}/current`)
//     // }})

//     const { data: loginData, status: loginStatus, error: loginError, mutate: loginMutate } = useMutation({
//         mutationFn: (formData) => {
//             return fetch(`${import.meta.env.VITE_API_DOMAIN}/login`, formData)
//         }, onSuccess: () => {
//             toast.success("You have successfully logged in!");
//             navigate("/")
//         }, onError: () => {
//             toast.error("There was an issue logging in!")
//         }
//     })

//     const { data: registerData, status: registerStatus, error: registerError, mutate: registerMutate } = useMutation({
//         mutationFn: (formData) => {
//             return fetch(`${import.meta.env.VITE_API_DOMAIN}/register`, formData)
//         }
//         , onSuccess: () => {
//             toast.success("You have successfully registered!");
//             navigate("/")
//         }, onError: () => {
//             toast.error("There was an issue registering!")
//         }
//     })

//     const { data: logoutData, status: logoutStatus, error: logoutError, mutate: logoutMutate } = useMutation({
//         mutationFn: (formData) => {
//             return fetch(`${import.meta.env.VITE_API_DOMAIN}/logout`, formData)
//         }
//         , onSuccess: () => {
//             toast.success("You have successfully logged out!");
//             navigate("/")
//         }, onError: () => {
//             toast.error("There was an issue logging out!")
//         }
//     })


//     useEffect(() => {

//     }, [])

//     return {
//         login: {
//             data: loginData,
//             status: loginStatus,
//             error: loginError,
//             mutate: loginMutate
//         }, register: {
//             data: registerData,
//             status: registerStatus,
//             error: registerError,
//             mutate: registerMutate
//         }, logout: {
//             data: logoutData, status: logoutStatus, error: logoutError, mutuate: logoutMutate
//         }
//     };
// }

// export default useAuth;