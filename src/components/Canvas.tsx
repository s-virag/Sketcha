import { useLayoutEffect, useState } from "react";
import { Element, ElementType, SelectedElement } from "../models/Element";
import useDrawing from "../context/DrawingContext";
import { elementTypeToTool, isWithinElement } from "../utils/utils";
import rough from "roughjs";
import { Drawable } from "roughjs/bin/core";
import { Action, Tool } from "../models/Action";

const generator = rough.generator();

function getElementOnPosition(x: number, y: number, elements: Element[]) {
    return elements.find(element => isWithinElement(x, y, element));
}


const Canvas = () => {
    const [elements, setElements] = useState<Element[]>([]);
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
    const drawingContext = useDrawing();

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rc = rough.canvas(canvas);
        elements.forEach(({ roughElement }) => {
            rc.draw(roughElement);
        });
    }, [elements]);

    function createElement(id: number, x1: number, y1: number, x2: number, y2: number, tool: Tool, color: string): Element {
        let roughElement: Drawable;
        let type: ElementType = ElementType.Line;

        switch (tool) {
            case Tool.Rectangle:
                roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
                    fill: color,
                    fillStyle: "zigzag"
                });
                type = ElementType.Rectangle;
                break;
            case Tool.Line:
                roughElement = generator.line(x1, y1, x2, y2, {
                    stroke: color,
                    strokeLineDash: [5, 5]
                });
                type = ElementType.Line;
                break;
            case Tool.Move:
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
            color,
            roughElement,
        };
    }

    const updateElement = (id: number, x1: number, y1: number, x2: number, y2: number) => {
        
        const updatedElement = createElement(id, x1, y1, x2, y2, elementTypeToTool(elements[id].type), elements[id].color);
        console.log(id, elements[id].color);
        const elementsCopy = [...elements];
        elementsCopy[id] = updatedElement;
        setElements(elementsCopy);
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        const { clientX, clientY } = event;

        if (drawingContext.tool === Tool.Move) {
            const element = getElementOnPosition(clientX, clientY, elements);
            if (element) {
                const offsetX = clientX - element.x1;
                const offsetY = clientY - element.y1;
                setSelectedElement({ ...element, offsetX, offsetY });
                drawingContext.setAction(Action.Selection);
            }
        } else {
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, drawingContext.tool, drawingContext.color);
            setElements(prevState => [...prevState, element]);

            drawingContext.setAction(Action.Draw);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        const { clientX, clientY } = event;
        if (drawingContext.action === Action.Draw) {
            const index = elements.length - 1;

            updateElement(index, elements[index].x1, elements[index].y1, clientX, clientY);
        } else if (drawingContext.action === Action.Selection) {
            (event.target as HTMLElement).style.cursor = "move";

            const { id, x1, y1, x2, y2, offsetX, offsetY } = selectedElement!;
            const width = x2 - x1;
            const height = y2 - y1;
            const nextX = clientX - offsetX;
            const nextY = clientY - offsetY

            updateElement(id, nextX, nextY, nextX + width, nextY + height);
        }
    };

    const handleMouseUp = (event: React.MouseEvent) => {
        (event.target as HTMLElement).style.cursor = "default";
        drawingContext.setAction(Action.None);
        setSelectedElement(null);
    };

    return (
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
    );
}

export default Canvas;