import { useLayoutEffect, useState } from "react";
import rough from "roughjs";
import { Drawable } from "roughjs/bin/core";

const generator = rough.generator();
type ElementType = "rectangle" | "line";
type Action = "none" | "draw" | "move";
type Element = { 
  id: number,
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number; 
  type: ElementType; 
  roughElement: Drawable 
};
type SelectedElement = Element & { offsetX: number, offsetY: number };


function createElement(id: number, x1: number, y1: number, x2: number, y2: number, tool: "rectangle" | "line" | "move") : Element {
  let roughElement: Drawable;
  let type: ElementType = "line";
  switch (tool) {
    case "rectangle":
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      roughElement.options.fill = "blue";
      roughElement.options.fillStyle = "zigzag";
      type = "rectangle";
      break;
    case "line":
      roughElement = generator.line(x1, y1, x2, y2);
      type = "line";
      break;
    case "move":

    default:
      roughElement = generator.line(x1, y1, x2, y2);
      break;
  }
  return {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    roughElement,
  };
}

function getElementOnPosition(x: number, y: number, elements: Element[]) {
  return elements.find(element => isWithinElement(x, y, element));
}

function isWithinElement(x: number, y: number, element: Element) {
  if(element.type === 'line') {
    const a = { x: element.x1, y: element.y1 };
    const b = { x: element.x2, y: element.y2 };
    const c = { x, y };
    const offset = distance(a, c) + distance(b, c) - distance(a, b);
    return Math.abs(offset) < 1;
  } else if(element.type === 'rectangle') {
    const minX = Math.min(element.x1, element.x2);
    const maxX = Math.max(element.x1, element.x2);
    const minY = Math.min(element.y1, element.y2);
    const maxY = Math.max(element.y1, element.y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
}

const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function App() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [action, setAction] = useState<Action>("none");
  const [tool, setTool] = useState<"rectangle" | "line" | "move">("line");

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => {
      rc.draw(roughElement);
    });
  }, elements);

  //type
  const updateElement = (id: number, x1: number, y1: number, x2: number, y2: number) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, elements[id].type);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;

    if (tool === "move") {
      const element = getElementOnPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction("move");
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements(prevState => [...prevState, element]);

      setAction("draw");
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    if (action === "draw") {
      const index = elements.length - 1;

      updateElement(index, elements[index].x1, elements[index].y1, clientX, clientY);
    }else if(action === "move") {
      (event.target as HTMLElement).style.cursor = "move";

      const {id, x1, y1, x2, y2, offsetX, offsetY} = selectedElement!;
      const width = x2 - x1;
      const height = y2 - y1;
      const nextX = clientX - offsetX;
      const nextY = clientY - offsetY

      updateElement(id, nextX, nextY, nextX+width, nextY+height);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    (event.target as HTMLElement).style.cursor = "default";
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      {/* Selection here */}
      <div style={{ position: "fixed" }}>
        <select value={tool} onChange={e => setTool(e.target.value as "rectangle" | "line" | "move")}>
          <option value="rectangle">Rectangle</option>
          <option value="line">Line</option>
          <option value="move">Move</option>
        </select>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </div>
  );
}

export default App;
