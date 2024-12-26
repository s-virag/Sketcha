import { LineElement, RectangleElement } from "./SimpleElement";
import { RoughGenerator } from "roughjs/bin/generator";
import { RoughCanvas } from "roughjs/bin/canvas";

export enum ElementType {
  Line = "line",
  Rectangle = "rectangle",
}

export interface Element {
  id: number;
  type: ElementType;
  color: string;
  position: string | null;

  positionWithinElement(x: number, y: number): string | null;
  resizedCoordinates(
    clientX: number,
    clientY: number
  ): { x1: number; y1: number; x2: number; y2: number };
  createRoughElement(generator: RoughGenerator): void;
  updateElement(x: number, y: number, generator: RoughGenerator): Element; // meg lehet oldani szerintem a creattel is csak talán felesleges
  moveElement(
    offsetX: number,
    offsetY: number,
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): Element;
  resizeElement(
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): Element;
  adjustElementCoordinates(generator: RoughGenerator): Element;
  drawElement(roughCanvas: RoughCanvas): void;
  getMouseRefCoordinates(): { x: number; y: number };
}

type CreationData = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

export class ElementFactory {
  static createElement(
    type: ElementType,
    data: CreationData,
    generator: RoughGenerator
  ): Element {
    let roughElement;
    switch (type) {
      case ElementType.Line:
        roughElement = generator.line(data.x1, data.y1, data.x2, data.y2, {
          stroke: data.color,
          strokeLineDash: [5, 5],
        });
        return new LineElement(
          data.id,
          data.color,
          data.x1,
          data.y1,
          data.x2,
          data.y2,
          roughElement,
          null
        );
      case ElementType.Rectangle:
        roughElement = generator.rectangle(
          data.x1,
          data.y1,
          data.x2 - data.x1,
          data.y2 - data.y1,
          {
            fill: data.color,
            fillStyle: "zigzag",
          }
        );
        return new RectangleElement(
          data.id,
          data.color,
          data.x1,
          data.y1,
          data.x2,
          data.y2,
          roughElement,
          null
        );
    }
  }
}

export type SelectedElement = Element & { offsetX: number; offsetY: number };
