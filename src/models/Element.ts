import { Drawable } from "roughjs/bin/core";

export type Element = { 
  id: number,
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number; 
  type: ElementType; 
  color: string;
  roughElement: Drawable 
};

export enum ElementType {
    Line = "line",
    Rectangle = "rectangle",
}

export type SelectedElement = Element & { offsetX: number, offsetY: number };