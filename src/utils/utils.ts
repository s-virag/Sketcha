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

export function isWithinElement(x: number, y: number, element: Element) {
    switch (element.type) {
        case ElementType.Line:
            const a = { x: element.x1, y: element.y1 };
            const b = { x: element.x2, y: element.y2 };
            const c = { x, y };
            const offset = distance(a, c) + distance(b, c) - distance(a, b);
            return Math.abs(offset) < 1;
        case ElementType.Rectangle:
            const minX = Math.min(element.x1, element.x2);
            const maxX = Math.max(element.x1, element.x2);
            const minY = Math.min(element.y1, element.y2);
            const maxY = Math.max(element.y1, element.y2);
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        default:
            return false;
    }
}