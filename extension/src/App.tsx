import CSSModules from "react-css-modules";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import styles from "./assets/App.module.css";
import "react-toastify/dist/ReactToastify.css";

const App = CSSModules(
  () => {
    return (
      <>
        <main styleName="main main--dark">
          <Outlet />
        </main>
        <ToastContainer />
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default App;
