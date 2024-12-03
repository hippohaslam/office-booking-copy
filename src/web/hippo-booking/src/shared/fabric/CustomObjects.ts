import { fabric } from "fabric";

interface CustomFabricObject extends fabric.Object {
  id?: string;
}

/**
 * check if the object is a custom fabric object by checking if it has an id property
 * @param object the object to check
 */
export function isCustomFabricObject(object: fabric.Object): object is CustomFabricObject {
  return object instanceof fabric.Object && "id" in object;
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

// Extend the fabric.Svg class to include an id property
class CustomObject extends fabric.Object {
  id: string;

  constructor(options: fabric.Object & { id: string }) {
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

class CustomGroup extends fabric.Group {
  id: string;

  constructor(options: fabric.IGroupOptions & { id: string }) {
    super([], options);
    this.id = options.id;
  }
}

export { CustomRect, CustomCircle, CustomObject, CustomGroup };
export type { CustomFabricObject, ExtendedCanvas };
