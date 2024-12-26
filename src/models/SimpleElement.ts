import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { distance, nearPoint } from "../utils/utils";
import { ElementType, Element } from "./Element";

abstract class SimpleElement implements Element {
  id: number;
  type: ElementType;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: Drawable;
  position: string | null;

  constructor(
    id: number,
    type: ElementType,
    color: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    roughElement: Drawable,
    position: string | null
  ) {
    this.id = id;
    this.type = type;
    this.color = color;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.roughElement = roughElement;
    this.position = position;
  }

  abstract positionWithinElement(x: number, y: number): string | null;
  abstract resizedCoordinates(
    clientX: number,
    clientY: number
  ): { x1: number; y1: number; x2: number; y2: number };
  abstract createRoughElement(generator: RoughGenerator): void;
  abstract updateElement(
    x: number,
    y: number,
    generator: RoughGenerator
  ): SimpleElement;
  abstract moveElement(
    offsetX: number,
    offsetY: number,
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): SimpleElement;
  abstract resizeElement(
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): SimpleElement;
  abstract adjustElementCoordinates(generator: RoughGenerator): SimpleElement;

  //for calculating offset
  getMouseRefCoordinates(): { x: number; y: number } {
    return { x: this.x1, y: this.y1 };
  }

  drawElement(roughCanvas: RoughCanvas): void {
    roughCanvas.draw(this.roughElement);
  }
}

export class LineElement extends SimpleElement {
  constructor(
    id: number,
    color: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    roughElement: Drawable,
    position: string | null
  ) {
    super(id, ElementType.Line, color, x1, y1, x2, y2, roughElement, position);
  }

  createRoughElement(generator: RoughGenerator): void {
    this.roughElement = generator.line(this.x1, this.y1, this.x2, this.y2, {
      stroke: this.color,
      strokeLineDash: [5, 5],
    });
  }

  positionWithinElement(x: number, y: number): string | null {
    const a = { x: this.x1, y: this.y1 };
    const b = { x: this.x2, y: this.y2 };
    const c = { x, y };
    const offset = distance(a, c) + distance(b, c) - distance(a, b);
    const start = nearPoint(x, y, this.x1, this.y1, "start");
    const end = nearPoint(x, y, this.x2, this.y2, "end");
    const insideLine = Math.abs(offset) < 1 ? "inside" : null;
    return start || end || insideLine;
  }

  resizedCoordinates(
    clientX: number,
    clientY: number
  ): { x1: number; y1: number; x2: number; y2: number } {
    switch (this.position) {
      case "start":
        return { x1: clientX, y1: clientY, x2: this.x2, y2: this.y2 };
      case "end":
        return { x1: this.x1, y1: this.y1, x2: clientX, y2: clientY };
      default:
        return {
          x1: this.x1,
          y1: this.y1,
          x2: this.x2,
          y2: this.y2,
        }; //or null
    }
  }

  updateElement(x: number, y: number, generator: RoughGenerator): LineElement {
    this.x2 = x;
    this.y2 = y;
    this.createRoughElement(generator);
    return this;
  }

  moveElement(
    offsetX: number,
    offsetY: number,
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): LineElement {
    const width = this.x2 - this.x1;
    const height = this.y2 - this.y1;
    const nextX = clientX - offsetX;
    const nextY = clientY - offsetY;

    let copy = new LineElement(
      this.id,
      this.color,
      nextX,
      nextY,
      nextX + width,
      nextY + height,
      this.roughElement,
      this.position
    );

    copy.createRoughElement(generator);
    return copy;
  }

  resizeElement(
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): LineElement {
    const { x1, y1, x2, y2 } = this.resizedCoordinates(clientX, clientY);

    let copy = new LineElement(
      this.id,
      this.color,
      x1,
      y1,
      x2,
      y2,
      this.roughElement,
      this.position
    );

    copy.createRoughElement(generator);
    return copy;
  }

  //ez jó?
  adjustElementCoordinates(generator: RoughGenerator): LineElement {
    if (this.x1 > this.x2 || (this.x1 === this.x2 && this.y1 > this.y2)) {
      const tempX = this.x1;
      const tempY = this.y1;
      this.x1 = this.x2;
      this.y1 = this.y2;
      this.x2 = tempX;
      this.y2 = tempY;

      this.createRoughElement(generator);
    }
    return this;
  }
}

export class RectangleElement extends SimpleElement {
  constructor(
    id: number,
    color: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    roughElement: Drawable,
    position: string | null
  ) {
    super(
      id,
      ElementType.Rectangle,
      color,
      x1,
      y1,
      x2,
      y2,
      roughElement,
      position
    );
  }

  createRoughElement(generator: RoughGenerator): void {
    this.roughElement = generator.rectangle(
      this.x1,
      this.y1,
      this.x2 - this.x1,
      this.y2 - this.y1,
      {
        fill: this.color,
        fillStyle: "zigzag",
      }
    );
  }

  positionWithinElement(x: number, y: number): string | null {
    const topLeft = nearPoint(x, y, this.x1, this.y1, "tl");
    const topRight = nearPoint(x, y, this.x2, this.y1, "tr");
    const bottomLeft = nearPoint(x, y, this.x1, this.y2, "bl");
    const bottomRight = nearPoint(x, y, this.x2, this.y2, "br");
    let inside =
      x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2
        ? "inside"
        : null;
    return topLeft || topRight || bottomLeft || bottomRight || inside;
  }

  resizedCoordinates(
    clientX: number,
    clientY: number
  ): { x1: number; y1: number; x2: number; y2: number } {
    switch (this.position) {
      case "tl":
        return { x1: clientX, y1: clientY, x2: this.x2, y2: this.y2 };
      case "tr":
        return { x1: this.x1, y1: clientY, x2: clientX, y2: this.y2 };
      case "bl":
        return { x1: clientX, y1: this.y1, x2: this.x2, y2: clientY };
      case "br":
        return { x1: this.x1, y1: this.y1, x2: clientX, y2: clientY };
      default:
        return {
          x1: this.x1,
          y1: this.y1,
          x2: this.x2,
          y2: this.y2,
        }; //or null
    }
  }

  updateElement(
    x: number,
    y: number,
    generator: RoughGenerator
  ): RectangleElement {
    this.x2 = x;
    this.y2 = y;
    console.log(this.x1, this.x2, this.y1, this.y2);
    this.createRoughElement(generator);
    return this;
  }

  moveElement(
    offsetX: number,
    offsetY: number,
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): RectangleElement {
    const width = this.x2 - this.x1;
    const height = this.y2 - this.y1;
    const nextX = clientX - offsetX;
    const nextY = clientY - offsetY;

    let copy = new RectangleElement(
      this.id,
      this.color,
      nextX,
      nextY,
      nextX + width,
      nextY + height,
      this.roughElement,
      this.position
    );

    copy.createRoughElement(generator);

    return copy;
  }

  resizeElement(
    clientX: number,
    clientY: number,
    generator: RoughGenerator
  ): SimpleElement {
    const { x1, y1, x2, y2 } = this.resizedCoordinates(clientX, clientY);

    let copy = new RectangleElement(
      this.id,
      this.color,
      x1,
      y1,
      x2,
      y2,
      this.roughElement,
      this.position
    );

    copy.createRoughElement(generator);
    return copy;
  }

  adjustElementCoordinates(generator: RoughGenerator): RectangleElement {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.x1, this.x2);
    const maxY = Math.max(this.y1, this.y2);
    this.x1 = minX;
    this.y1 = minY;
    this.x2 = maxX;
    this.y2 = maxY;

    this.createRoughElement(generator);
    return this;
  }
}
