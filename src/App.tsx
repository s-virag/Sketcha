import Canvas from "./components/Canvas";
import ColorSelector from "./components/ColorSelector";
import Toolbar from "./components/Toolbar";

function App() {
  return (
    <div>
      {/* Selection here */}
      <div className="fixed top-0 left-0 bg-transparent w-full flex justify-center gap-10">
        <ColorSelector />
        <Toolbar />
      </div>
      <Canvas />
    </div>
  );
}

export default App;
