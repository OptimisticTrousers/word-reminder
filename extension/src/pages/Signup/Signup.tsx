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

const Signup = CSSModules(
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
        return post(`${import.meta.env.VITE_API_DOMAIN}/auth/signup`, data);
      },
      onSettled: (data) => {
        if (data.message) {
          toast.error(data.message);
        } else if (data.status) {
          toast.error(
            `An unknown ${data.status} error occured while signing up.`
          );
        } else {
          dispatch({ type: "LOGIN", payload: data });
          toast.success(`You have successfully signed up, ${data.username}!`);
          navigate("/");
        }
      },
    });

    const onSubmit = (data: Schema) => {
      mutate(data);
    };

    const disabled = status === "pending";

    return (
      <section styleName="auth auth--register">
        <form styleName="auth__form" onSubmit={handleSubmit(onSubmit)}>
          <nav styleName="auth__navigation">
            <Link styleName="auth__link" to="/login">
              Cancel
            </Link>
            <h3 styleName="auth__title">Create account</h3>
            <button styleName="auth__button" type="submit">
              Submit
            </button>
          </nav>
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
          <p styleName="auth__error">{errors.username?.message}</p>
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
          <p styleName="auth__help">
            <b>Important:</b> Your password cannot be recovered if you forget
            it!
          </p>
        </form>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default Signup;
