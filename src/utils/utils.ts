import { Tool } from "../models/Action";
import { ElementType, Element } from "../models/Element";

export const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const elementTypeToTool = (type: ElementType) => {
    switch (type) {
        case ElementType.Line:
            return Tool.Line;
        case ElementType.Rectangle:
            return Tool.Rectangle;
        default:
            return Tool.Move;
    }
}

function positionWithinElement(x: number, y: number, element: Element) {
    const { x1, y1, x2, y2 } = element;
    switch (element.type) {
        case ElementType.Line:
            const a = { x: x1, y: y1 };
            const b = { x: x2, y: y2 };
            const c = { x, y };
            const offset = distance(a, c) + distance(b, c) - distance(a, b);
            const start = nearPoint(x, y, x1, y1, "start");
            const end = nearPoint(x, y, x2, y2, "end");
            const insideLine =  Math.abs(offset) < 1  ? "inside" : null;
            return start || end || insideLine;
        case ElementType.Rectangle:
            const topLeft = nearPoint(x, y, x1, y1, "tl");
            const topRight = nearPoint(x, y, x2, y1, "tr");
            const bottomLeft = nearPoint(x, y, x1, y2, "bl");
            const bottomRight = nearPoint(x, y, x2, y2, "br");
            let inside =  x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
            return topLeft || topRight || bottomLeft || bottomRight || inside;
        default:
            return null;
    }
}

function nearPoint(mx: number, my: number, px: number, py: number, position: string) {
    return Math.abs(mx - px) < 5 && Math.abs(my - py) < 5 ? position : null;
}

export function getElementOnPosition(x: number, y: number, elements: Element[]) {
    return elements
    .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
    .find(element => element.position !== null);
}

export function cursorForPosition(position: string | null) {
    switch (position) {
        case "tl":
        case "br":
        case "start":
        case "end":
            return "nwse-resize";
        case "tr":
        case "bl":
            return "nesw-resize";
        default:
            return "move";
    }
} 