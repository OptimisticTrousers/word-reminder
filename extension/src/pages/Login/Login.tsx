import { zodResolver } from "@hookform/resolvers/zod";
import CSSModules from "react-css-modules";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import styles from "../../assets/Auth.module.css";
import { ErrorMessage } from "../../components";
import useAuth from "../../hooks/useAuth";
import useHttp from "../../hooks/useHttp";

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

type Schema = z.infer<typeof schema>;

const Login = CSSModules(
  () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Schema>({
      defaultValues: {
        username: "",
        password: "",
      },
      resolver: zodResolver(schema),
    });
    const { dispatch } = useAuth();

    const { post } = useHttp();

    const navigate = useNavigate();

    const { status, mutate } = useMutation({
      mutationFn: (data: Schema) => {
        return post(`${import.meta.env.VITE_API_DOMAIN}/auth/login`, data);
      },
      onSettled: (data) => {
        if (data.message) {
          toast.error(data.message);
        } else if (data.status) {
          toast.error(
            `An unknown ${data.status} error occured while logging in.`
          );
        } else {
          dispatch({ type: "LOGIN", payload: data });
          toast.success(`You have successfully logged in, ${data.username}!`);
          navigate("/words");
        }
      },
    });

    const onSubmit = (data: Schema) => {
      mutate(data);
    };

    const disabled = status === "pending";

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
        <form styleName="auth__form" onSubmit={handleSubmit(onSubmit)}>
          <div styleName="auth__control">
            <label htmlFor="username" styleName="auth__label">
              <span styleName="auth__bold">Username</span>
            </label>
            <input
              styleName="auth__input"
              {...register("username", { required: true })}
              disabled={disabled}
            />
            {errors.username?.message && (
              <ErrorMessage message={errors.username.message} />
            )}
          </div>
          <div styleName="auth__control">
            <label htmlFor="password" styleName="auth__label">
              <span styleName="auth__bold">Password</span>
            </label>
            <input
              styleName="auth__input"
              type="password"
              {...register("password", { required: true })}
              disabled={disabled}
            />
            {errors.password?.message && (
              <ErrorMessage message={errors.password.message} />
            )}
          </div>
          <button styleName="auth__button" type="submit" disabled={disabled}>
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
