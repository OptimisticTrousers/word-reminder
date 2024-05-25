/* eslint-disable @typescript-eslint/no-explicit-any */
import CSSModules from "react-css-modules";
import styles from "../../assets/Auth.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const schema = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

const Login = CSSModules(
  () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        username: "",
        password: "",
      },
      resolver: zodResolver(schema),
    });

    const navigate = useNavigate();

    const { data, status, error, mutate }: any = useMutation({
      mutationFn: (formData) => {
        return fetch(`${import.meta.env.VITE_API_DOMAIN}/auth/login`, {
          body: JSON.stringify(formData),
        });
      },
      onSuccess: () => {
        toast.success("You have successfully logged in!");
        navigate("/");
      },
      onError: () => {
        toast.error("There was an issue logging in!");
      },
    });

    console.log(data);
    console.log(status);
    console.log(error);

    const onSubmit = handleSubmit(mutate);

    return (
      <section styleName="auth auth--login">
        <div styleName="auth__box">
          <div styleName="auth__hero">
            <h2>Word Storer</h2>
            <p styleName="auth__description">
              Log in or create a new account to start storing your words.
            </p>
          </div>
        </div>
        <form styleName="auth__form" onSubmit={onSubmit}>
          <div styleName="auth__control">
            <label htmlFor="username" styleName="auth__label">
              <span styleName="auth__bold">Username</span>
            </label>
            <input
              {...register("username", { required: "This is required." })}
              styleName="auth__input"
            />
            <p styleName="auth__error">{errors.username?.message}</p>
          </div>
          <div styleName="auth__control">
            <label htmlFor="password" styleName="auth__label">
              <span styleName="auth__bold">Password</span>
            </label>
            <input
              type="password"
              {...register("password", { required: "This is required." })}
              styleName="auth__input"
            />
            <p styleName="auth__error">{errors.username?.message}</p>
          </div>
          <button styleName="auth__button" type="submit">
            Login
          </button>
        </form>
        <p styleName="auth__create">
          New around here? <Link to="/register">Create account</Link>
        </p>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default Login;
