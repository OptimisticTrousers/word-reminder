import CSSModules from "react-css-modules";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoutes";
import styles from "./assets/App.module.css";
import "react-toastify/dist/ReactToastify.css";

const App = CSSModules(
  () => {
    return (
      <>
        <main styleName="main main--dark">
          <ProtectedRoute />
        </main>
        <ToastContainer />
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default App;
