import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { CustomCircle, CustomFabricObject, CustomGroup, CustomObject, CustomRect, ExtendedCanvas } from "./CustomObjects";
import { isNullOrEmpty } from "../../helpers/StringHelpers";

const generateUniqueId = (): string => {
  return uuidv4();
};

export type SharedCanvasOptions = {
  backgroundColor: string;
  width: number;
  height: number;
  selection: boolean;
  allowTouchScrolling: boolean;
};

const loadCanvas = (
  canvasJson: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>,
  options: SharedCanvasOptions,
) => {
  if (isNullOrEmpty(canvasJson)) {
    const canvas = new fabric.Canvas(canvasRef.current, options);
    canvas.selection = options.selection;
    canvas.allowTouchScrolling = options.allowTouchScrolling;
    fabricCanvasRef.current = canvas;
    return canvas;
  } else {
    const canvas = new fabric.Canvas(canvasRef.current).loadFromJSON(canvasJson, () => {
      fabricCanvasRef.current?.renderAll();
    });
    fabricCanvasRef.current = canvas;
    return canvas;
  }
};

const initializeCanvasZoom = (canvas: fabric.Canvas) => {
  canvas.on("mouse:wheel", function (opt) {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });
};

const initializeCanvasDragging = (canvas: fabric.Canvas, requireAltKeyForMouse = false) => {
  canvas.on("touchstart", function (this: ExtendedCanvas, opt) {
    const evt = opt.e as TouchEvent;
    if (evt.touches && evt.touches.length === 1) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.touches[0].clientX;
      this.lastPosY = evt.touches[0].clientY;
    }
  });

  canvas.on("touchmove", function (this: ExtendedCanvas, opt) {
    const evt = opt.e as TouchEvent;
    if (this.isDragging && this.lastPosX !== undefined && this.lastPosY !== undefined) {
      const vpt = this.viewportTransform;
      if (vpt !== undefined) {
        vpt[4] += evt.touches[0].clientX - this.lastPosX;
        vpt[5] += evt.touches[0].clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = evt.touches[0].clientX;
        this.lastPosY = evt.touches[0].clientY;
      }
    }
  });

  canvas.on("touchend", function (this: ExtendedCanvas) {
    if (this.viewportTransform) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    }
  });

  function handleTouchDown(this: ExtendedCanvas, opt: fabric.IEvent) {
    const evt = opt.e as TouchEvent;
    if (evt.touches && evt.touches.length === 1) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.touches[0].clientX;
      this.lastPosY = evt.touches[0].clientY;
    }
  }

  function handleTouchMove(this: ExtendedCanvas, opt: fabric.IEvent) {
    const evt = opt.e as TouchEvent;
    if (this.isDragging && this.lastPosX !== undefined && this.lastPosY !== undefined) {
      const vpt = this.viewportTransform;
      if (vpt !== undefined) {
        vpt[4] += evt.touches[0].clientX - this.lastPosX;
        vpt[5] += evt.touches[0].clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = evt.touches[0].clientX;
        this.lastPosY = evt.touches[0].clientY;
      }
    }
  }

  canvas.on("mouse:down", function (this: ExtendedCanvas, opt) {
    const evt = opt.e;
    if (evt.type === "touchstart") {
      handleTouchDown.call(this, opt);
    } else {
      const drag = () => {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      };

      if (evt.altKey || !requireAltKeyForMouse) {
        drag();
      }
    }
  });
  canvas.on("mouse:move", function (this: ExtendedCanvas, opt) {
    if (this.isDragging && this.lastPosX !== undefined && this.lastPosY !== undefined) {
      const evt = opt.e;
      if (evt.type === "touchmove") {
        handleTouchMove.call(this, opt);
      } else {
        const vpt = this.viewportTransform;
        if (vpt !== undefined) {
          vpt[4] += evt.clientX - this.lastPosX;
          vpt[5] += evt.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      }
    }
  });
  canvas.on("mouse:up", function (this: ExtendedCanvas) {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    if (this.viewportTransform) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    }
  });
};

function AdjustCanvasSize(canvas: fabric.Canvas, width: number, height: number) {
  if (canvas) {
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
  }
}

function getCanvasJsonAsString(canvas: fabric.Canvas | null) {
  if (canvas) {
    return JSON.stringify(canvas.toJSON(["id"]));
  }
  return null;
}

// Canvas object functions

const addLine = (canvas: fabric.Canvas | null) => {
  if (canvas) {
    const line = new fabric.Line([100, 800, 100, 600], {
      left: 170,
      top: 150,
      stroke: "black",
      strokeWidth: 20,
    });
    canvas.add(line);
    canvas.renderAll();
  }
};

const addText = (canvas: fabric.Canvas | null) => {
  if (canvas) {
    const text = new fabric.Text("Hello, World!", {
      left: 100,
      top: 100,
      fill: "black",
      fontFamily: '"DM Sans","serif"',
    });
    text.bringForward();
    canvas.add(text);
    canvas.renderAll();
  }
};

const addCircle = (canvas: fabric.Canvas | null) => {
  if (canvas) {
    const circle = new CustomCircle({
      radius: 50,
      width: 50,
      height: 50,
      left: 100,
      top: 100,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      id: generateUniqueId(),
    });
    canvas.add(circle);
    canvas.renderAll();
  }
};

const addSquare = (canvas: fabric.Canvas | null) => {
  if (canvas) {
    const square = new CustomRect({
      width: 50,
      height: 50,
      left: 150,
      top: 150,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      id: generateUniqueId(),
    });
    canvas.add(square);
    canvas.renderAll();
  }
};

const addSvgFromString = (canvas: fabric.Canvas | null, svgString: string) => {
  if (canvas) {
    fabric.loadSVGFromString(svgString, (objects) => {
      const group = new fabric.Group(objects as CustomObject[]) as CustomGroup;
      group.set("id", generateUniqueId());
      canvas.add(group);
      canvas.renderAll();
    });
  }
}

/**
 * 
 * @param canvas
 * @param url 
 */
const addSvgFromUrl = (canvas: fabric.Canvas | null, url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (canvas) {
      // loadSVGFromURL is a promise in fabric v6
      fabric.loadSVGFromURL(url, (objects) => {
        const group = fabric.util.groupSVGElements(objects) as CustomGroup;
        group.set("id", generateUniqueId());
        canvas.add(group);
        canvas.renderAll();
        resolve();
      });
    } else {
      reject("Canvas is null");
    }
  });
}

const sendToPosition = (canvas: fabric.Canvas | null, position: "front" | "back") => {
  if (canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (position === "back") {
        canvas.sendToBack(activeObject);
      } else if (position === "front") {
        canvas.bringToFront(activeObject);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }
}

/**
 * Find an object on the canvas by its id
 * @param canvas - The canvas
 * @param id - The id of the object to find
 * @returns The object if found, otherwise null
 */
const findObjectById = (canvas: fabric.Canvas | null, id: string): CustomFabricObject | null => {
  if (canvas) {
    const object = canvas.getObjects().find((obj: CustomFabricObject) => obj.id === id);
    return object ? object : null;
  }
  return null;
}

/**
 * Select the active object and then clone it onto the canvas
 * @param canvas - The canvas
 */
const copyActiveObject = (canvas: fabric.Canvas | null) => {
  if (canvas) {
    const activeObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    const forSelect: CustomFabricObject[] = [];
    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((activeObject: CustomFabricObject) => {
        activeObject.clone((cloned: CustomFabricObject) => {
          // Only generate a new id if the original object has an id, meaning it was a custom bookable object.
          if (!isNullOrEmpty(activeObject.id)) {
            cloned.set("id", generateUniqueId());
          }
          cloned.set("left", activeObject?.left ? activeObject.left + 10 : 150);
          cloned.set("top", activeObject?.top ? activeObject.top + 10 : 150);
          forSelect.push(cloned);
          canvas?.add(cloned);
        });
      });
      canvas.setActiveObject(
        new fabric.ActiveSelection(forSelect, {
          canvas: canvas,
        }),
      );
    }
    canvas.renderAll();
  }
};


/**
 * Remove the active object(s) from the canvas
 * @param canvas - The canvas
 * @returns Promise that resolves with an array of id strings of the removed objects if they had one
 */
const removeActiveObjectsAsync = (canvas: fabric.Canvas | null): Promise<string[]> => {
  return new Promise((resolve) => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      const removedObjectIds: string[] = [];
      activeObjects.forEach((activeObject: CustomFabricObject) => {
        if (activeObject.id) {
          removedObjectIds.push(activeObject.id);
        }
        canvas.remove(activeObject);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      resolve(removedObjectIds);
    }
  });
}

/**
 * Set active object by passing in an object Id to find. Else unselect
 * @param canvas 
 * @param id
 * @return 
 */
const findAndSetActiveObject = (canvas: fabric.Canvas | null, id: string | null) => {
  if (canvas) {
    if (id) {
      const object = findObjectById(canvas, id);
      if (object) {
        canvas.setActiveObject(object);
      }
    } else {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
  }
}

const setObjectFill = (canvas: fabric.Canvas | null, object: CustomFabricObject, fill: string) => {
  if (canvas) {
    object.set("fill", fill);
    canvas.renderAll();
  }
}

export type CustomFabricObjectColourList = {
  object: CustomFabricObject;
  fill: string;
  stroke: string;
}

/**
* Set the fill and stroke of objects with the specified ID's
* @param canvas
* @param id
* @param fill
* @param stroke
* @return 
*/
const setObjectsFillAndStrokeById = (canvas: fabric.Canvas | null, id: string[], fill: string, stroke: string) => {
  if (canvas) {
    id.forEach((id) => {
      const object = findObjectById(canvas, id);
      if (object) {
        // check if it's a group
        if (object && object.type === "group") {
          const group = object as CustomGroup;
          group.forEachObject((obj: CustomFabricObject) => {
            obj.set("fill", fill);
            obj.set("stroke", stroke);
          });
        } else {
          object.set("fill", fill);
          object.set("stroke", stroke);
        }
      }
    });
    canvas.renderAll();
  }
}

/**
 * Reset all object colours to white. Does not effect SVG objects. Ignores text objects
 * @param canvas 
 */
const resetObjectColoursToWhite = (canvas: fabric.Canvas | null) => {
  if (canvas) {

    canvas.getObjects().forEach((object) => {
      const isText = object.type?.toLowerCase() === "text";
      if (isText === false) {
        object.set("fill", "white");
        object.set("stroke", "black");
      }
    });
    canvas.renderAll();
  }
}


// General functions
const zoomIn = (canvas: fabric.Canvas) => {
  const zoom = canvas.getZoom();
  const center = canvas.getCenter();

  const newZoom = zoom * 1.2;

  canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
}

const zoomOut = (canvas: fabric.Canvas) => {
  const zoom = canvas.getZoom();
  const center = canvas.getCenter();

  const newZoom = zoom / 1.2;

  canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
}

/**
  * Set all objects on the canvas to non-selectable. Pointers are default
  * @param canvas
  * @return
 */
const setAllObjectsNonSelectable = (canvas: fabric.Canvas) => {
  canvas.forEachObject((object: CustomFabricObject) => {
    if (object) {
      object.selectable = false;
      object.lockMovementX = true;
      object.lockMovementY = true;
      object.hasControls = false;
      object.hasBorders = false;
      if (object.type === "text") {
        object.selectable = false;
        object.evented = false;
      }
      object.hoverCursor = "default";
    }
  });
  canvas.renderAll();
}

/**
 * Finds all objects with specified ID's and sets the hover cursor to pointer
 * @param canvas 
 * @param ids 
 */
const setCurserToPointer = (canvas: fabric.Canvas, ids: string[]) => {
  ids.forEach((id) => {
    const object = findObjectById(canvas, id);
    if (object) {
      object.hoverCursor = "pointer";
    }
  });
  canvas.renderAll();
}


export {

  // Canvas functions
  loadCanvas,
  initializeCanvasZoom,
  initializeCanvasDragging,
  AdjustCanvasSize,
  getCanvasJsonAsString,

  // Canvas object functions
  addLine,
  addText,
  addCircle,
  addSquare,
  addSvgFromString,
  addSvgFromUrl,
  findObjectById,
  copyActiveObject,
  removeActiveObjectsAsync,
  sendToPosition,
  setObjectFill,
  findAndSetActiveObject,
  setObjectsFillAndStrokeById,
  resetObjectColoursToWhite,
  setAllObjectsNonSelectable,
  setCurserToPointer,
  // General functions
  zoomIn,
  zoomOut
};

