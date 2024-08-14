import { FaWindows } from "react-icons/fa";
import "./App.css";
import { WindowManager } from "./components/WindowManagerProvider";

const initialWindows = [
  {
    id: "1",
    title: "Ventana 1",
    icon: <FaWindows />,
    content: <p>Contenido de la ventana 1</p>,
  },
  {
    id: "2",
    title: "Ventana 2",
    icon: <FaWindows />,
    content: (
      <div>
        <h2>Ventana 2</h2>
        <button>Botón de ejemplo</button>
      </div>
    ),
  },
];

function App() {
  return (
    <>
      <div className="App">
        <WindowManager initialWindows={initialWindows} />
      </div>
    </>
  );
}

export default App;
