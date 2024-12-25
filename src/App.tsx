import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import ColorSelector from "./components/ColorSelector";
import Toolbar from "./components/Toolbar";
import UndoRedo from "./components/UndoRedo";
import useHistory from "./hooks/useHistory";

function App() {
  const [elements, setElements, undo, redo ] = useHistory([]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLocaleLowerCase() === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown); //cleanup
  }, [redo,undo]);

  useEffect(() => {
    const panFunction = (e: WheelEvent) => {
      setPanOffset((prev: { x: number; y: number; }) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    };
    document.addEventListener("wheel", panFunction);
    return () => document.removeEventListener("wheel", panFunction); //cleanup
  }, [setPanOffset]);

  return (
    <div>
      {/* Selection here */}
      <div className="fixed top-0 left-0 bg-transparent w-full h-min flex justify-center gap-10">
        <ColorSelector />
        <Toolbar />
      </div>
      <div className="fixed bottom-0 left-0 bg-transparent w-full h-min flex justify-center gap-10 ">
        <UndoRedo undo={undo} redo={redo} />
      </div>
      <Canvas elements={elements} setElements={setElements} panOffset={panOffset} setPanOffset={setPanOffset} />
    </div>
  );
}

export default App;
