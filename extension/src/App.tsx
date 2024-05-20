import { Outlet } from "react-router-dom";
import CSSModules from "react-css-modules";
import styles from "./App.module.css";

const App = CSSModules(() => {
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

  return (
    <main styleName="main main--dark">
      <Outlet />
    </main>
  );
}, styles, { allowMultiple: true, handleNotFoundStyleName: "ignore" })

export default App;
