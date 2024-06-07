import { fabric } from "fabric";

interface CustomFabricObject extends fabric.Object {
    id?: string;
}

interface ExtendedCanvas extends fabric.Canvas {
    isDragging?: boolean;
    lastPosX?: number;
    lastPosY?: number;
  }

// Extend the fabric.Rect class to include an id property
class CustomRect extends fabric.Rect {
    id: string;

    constructor(options: fabric.IRectOptions & { id: string }) {
        super(options);
        this.id = options.id;
    }
}

// Extend the fabric.Circle class to include an id property
class CustomCircle extends fabric.Circle {
    id: string;

    constructor(options: fabric.ICircleOptions & { id: string }) {
        super(options);
        this.id = options.id;
    }
}

export { CustomRect, CustomCircle };
export type { CustomFabricObject, ExtendedCanvas };