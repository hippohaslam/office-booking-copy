import { fabric } from "fabric";
import { ExtendedCanvas } from "./CustomObjects";
import { isNullOrEmpty } from "../../helpers/StringHelpers";

type CanvasOptions = {
  backgroundColor: string;
  width: number;
  height: number;
};

const loadCanvas = (
  canvasJson: string,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>,
  options: CanvasOptions,
) => {
  if (isNullOrEmpty(canvasJson)) {
    const canvas = new fabric.Canvas(canvasRef.current, options);
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

export { loadCanvas, initializeCanvasZoom, initializeCanvasDragging };
