import { FaWindows } from "react-icons/fa";
import "./App.css";
import Window from "./components/Window";

function App() {
  return (
    <>
      <div className="App">
        <Window
          initialWidth={400}
          initialheight={300}
          icon={<FaWindows />}
          title="Mi Ventana"
        />
      </div>
    </>
  );
}

export default App;
