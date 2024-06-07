import { ExtendedCanvas } from "./CustomObjects";

const initializeCanvasZoom = (canvas: fabric.Canvas) => {
    canvas.on('mouse:wheel', function(opt) {
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
  
  const initializeCanvasDragging = (canvas: fabric.Canvas) => {
    canvas.on("mouse:down", function (this: ExtendedCanvas, opt) {
      const evt = opt.e;
      if (evt.altKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });
    canvas.on("mouse:move", function (this: ExtendedCanvas, opt) {
      if (
        this.isDragging &&
        this.lastPosX !== undefined &&
        this.lastPosY !== undefined
      ) {
        const e = opt.e;
        const vpt = this.viewportTransform;
        if (vpt !== undefined) {
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
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

  export { initializeCanvasZoom, initializeCanvasDragging };