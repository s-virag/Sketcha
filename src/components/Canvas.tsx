import { useLayoutEffect, useState } from "react";
import { Element, ElementFactory, SelectedElement } from "../models/Element";
import useDrawing from "../context/DrawingContext";
import { getElementOnPosition, cursorForPosition, getMouseCoordinates, toolToElementType, getElementOnPositionNotOverwrite } from "../utils/utils";
import rough from "roughjs";
import { Action, Tool } from "../models/Action";

const generator = rough.generator();

const Canvas = ({ elements, setElements, panOffset, setPanOffset }: { elements: Element[], setElements: (action: any, overwrite?: boolean) => void, panOffset: { x: number, y: number }, setPanOffset: (offset: { x: number, y: number }) => void }) => {
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
    const drawingContext = useDrawing();
    const [startPanMousePosition, setStartPanMousePosition] = useState({ x: 0, y: 0 });

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        const rc = rough.canvas(canvas);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);

        elements.forEach( element => {
            element.drawElement(rc);
        });
        
        ctx.restore();
    }, [elements, drawingContext.action, selectedElement, panOffset]);

    const handleMouseDown = (event: React.MouseEvent) => {
        const { clientX, clientY } = getMouseCoordinates(event, panOffset);

        if (event.button === 1 || drawingContext.pressedKeys.has(" ")) {
            drawingContext.setAction(Action.Pan);
            setStartPanMousePosition({ x: clientX, y: clientY });
            return;
        }

        if (drawingContext.tool === Tool.Selection) {
            const element = getElementOnPosition(clientX, clientY, elements);
            if (element) {
                let coord = element.getMouseRefCoordinates();

                const offsetX = clientX - coord.x;
                const offsetY = clientY - coord.y;

                setSelectedElement({ ...element, offsetX, offsetY });
                setElements((prevState: any) => prevState);

                if (element.position === "inside") {
                    drawingContext.setAction(Action.Move);
                } else {
                    drawingContext.setAction(Action.Resize);
                }
                console.log(drawingContext.action)
            }
        } else {
            const id = elements.length;
            let element = ElementFactory.createElement(toolToElementType(drawingContext.tool), {id: id, x1: clientX, y1: clientY, x2: clientX, y2: clientY, color: drawingContext.color}, generator);
            setElements((prevState: any) => [...prevState, element]);
            setSelectedElement({ ...element, offsetX: 0, offsetY: 0 });

            drawingContext.setAction(Action.Draw);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        const { clientX, clientY } = getMouseCoordinates(event, panOffset);

        if (drawingContext.action === Action.Pan) {
            const deltaX = clientX - startPanMousePosition.x;
            const deltaY = clientY - startPanMousePosition.y;
            setPanOffset({
                x: panOffset.x + deltaX,
                y: panOffset.y + deltaY,
            });
            return;
        }

        if (drawingContext.tool === Tool.Selection) {
            //ezt a draw & action cuccot refactorálni kell
            const element = getElementOnPositionNotOverwrite(clientX, clientY, elements);
            (event.target as HTMLElement).style.cursor = element
                ? cursorForPosition(element.position)
                : "default";
        }

        if (drawingContext.action === Action.Draw) {
            const index = elements.length - 1;
            //updateElement(index, elements[index].x1, elements[index].y1, clientX, clientY);
            //updateElement(index, clientX, clientY);
            let updatedElement = elements[index].updateElement(clientX, clientY, generator); //ez kelll?? nem updateli magát?

            const elementsCopy = [...elements];
            elementsCopy[index] = updatedElement;
            setElements(elementsCopy, true);
        }
        if (drawingContext.action === Action.Move) {
            const { id, offsetX, offsetY } = selectedElement!;

            let updatedElement = elements[id].moveElement(offsetX, offsetY, clientX, clientY, generator);
            const elementsCopy = [...elements];
            elementsCopy[id] = updatedElement;
            setElements(elementsCopy, true);
        }
        if (drawingContext.action === Action.Resize) {
            let updatedElement = elements[selectedElement!.id].resizeElement(clientX, clientY, generator);
            const elementsCopy = [...elements];
            elementsCopy[selectedElement!.id] = updatedElement;
            setElements(elementsCopy, true);
        }
    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (drawingContext.action === Action.Pan) {
            drawingContext.setAction(Action.None);
            return;
        }
        const index = selectedElement!.id;
        const id = elements[index].id;
        if (drawingContext.action === Action.Draw || drawingContext.action === Action.Resize) {

            let updatedElement = elements[id].adjustElementCoordinates(generator);
            const elementsCopy = [...elements];
            elementsCopy[id] = updatedElement;
            setElements(elementsCopy, true);
        }

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
            className="absolute top-0 left-0 -z-10"
        >
            Canvas
        </canvas>
    );
}

export default Canvas;