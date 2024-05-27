import { zodResolver } from "@hookform/resolvers/zod";
import CSSModules from "react-css-modules";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import styles from "../../assets/Auth.module.css";
import { ErrorMessage } from "../../components";
import useHttp from "../../hooks/useHttp";
import { Error500 } from "..";

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

    const { post } = useHttp();

    const navigate = useNavigate();

    const { data, status, error, mutate } = useMutation({
      mutationFn: (data: Schema) => {
        return post(`http://localhost:5000/api/auth/login`, data);
      },
      onSuccess: (data) => {
        toast.success(`You have successfully logged in, ${data.username}!`);
        navigate("/");
      },
      onError: (error) => {
        console.error(error);
        toast.error("There was an issue logging in!");
      },
    });

    const onSubmit = (data: Schema) => {
      mutate(data);
    };

    const disabled = status === "pending";

    console.log(data);

    if (error) {
      return <Error500 message={error.message} />;
    }

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
              {...register("username", { required: "This is required." })}
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
              {...register("password", { required: "This is required." })}
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
