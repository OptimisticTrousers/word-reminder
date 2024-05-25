/* eslint-disable @typescript-eslint/no-explicit-any */
import CSSModules from "react-css-modules";
import styles from "../../assets/Auth.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

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

const Register = CSSModules(
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
        return axios.post(
          `${import.meta.env.VITE_API_DOMAIN}/auth/signup`,
          formData
        );
      },
      onSuccess: () => {
        toast.success("You have successfully registered!");
        navigate("/");
      },
      onError: () => {
        toast.error("There was an issue registering!");
      },
    });

    console.log(data);
    console.log(status);
    console.log(error);

    const onSubmit = handleSubmit(mutate);

    return (
      <section styleName="auth auth--register">
        <form styleName="auth__form" onSubmit={onSubmit}>
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
              {...register("username", { required: "This is required." })}
              styleName="auth__input"
            />
          </div>
          <p styleName="auth__error">{errors.username?.message}</p>
          <div styleName="auth__control">
            <label htmlFor="password" styleName="auth__label">
              <span styleName="auth__bold">Password</span>
            </label>
            <input
              {...register("password", { required: "This is required." })}
              styleName="auth__input"
            />
          </div>
          <p styleName="auth__error">{errors.password?.message}</p>
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

export default Register;
