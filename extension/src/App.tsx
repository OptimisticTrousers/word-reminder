import CSSModules from "react-css-modules";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Loading from "./components/Loading";
import styles from "./assets/App.module.css";
import { Error500 } from "./pages";
import "react-toastify/dist/ReactToastify.css";

const App = CSSModules(
  () => {
    // const [colour, setColour] = useState("");
    // ("blue");
    // const onclick = async () => {
    //   let [tab] = await chrome.tabs.query({ active: true });
    //   chrome.scripting.executeScript<string[], void>({
    //     target: { tabId: tab.id! },
    //     args: [colour],
    //     func: (colour) => {
    //       document.body.style.backgroundColor = colour;
    //     },
    //   });
    // };
    const {
      data: user,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["user"],
      queryFn: () => {
        return fetch(`${import.meta.env.VITE_API_DOMAIN}/auth/current`, {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }).then((res) => {
          return res.json();
        });
      },
    });

    if (isLoading) {
      return <Loading />;
    }

    if (isError) {
      return <Error500 message={error.message} />;
    }

    console.log(user);

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
