import { useState } from "react";
import CSSModules from "react-css-modules";
import styles from "./Login.module.css";

const Login = CSSModules(
  () => {
    const { username, setUsername } = useState("");
    const { email, setEmail } = useState("");

    return (
      <section styleName="auth">
        <div styleName="auth__box">
          <div styleName="auth__hero">
            <h2>Word Storer</h2>
            <p styleName="auth__description">
              Log in or create a new account to start storing your words.
            </p>
          </div>
        </div>
        <form styleName="auth__form">
          <div styleName="auth__control">
            <label htmlFor="username" styleName="auth__label">
              <span styleName="auth__bold">Username</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              styleName="auth__input"
              required
            />
          </div>
          <div styleName="auth__control">
            <label htmlFor="password" styleName="auth__label">
              <span styleName="auth__bold">Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              styleName="auth__input"
              required
            />
          </div>
        </form>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default Login;
