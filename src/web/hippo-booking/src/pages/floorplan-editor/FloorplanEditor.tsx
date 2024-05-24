import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import './FloorplanEditor.scss';

interface Desk {
  id: string;
  name: string;
  floorplanId?: string;
}

const generateUniqueId = () => {
    return uuidv4();
};

const lotsOfDesks = [
{ id: generateUniqueId(), name: 'Desk 1' },
{ id: generateUniqueId(), name: 'Desk 2' },
{ id: generateUniqueId(), name: 'Desk 3' },
]

// TODO: How to draw lines

const FloorplanEditor = () => {
    // @ts-ignore
  const [desks, setDesks] = useState<Desk[]>(lotsOfDesks);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Just for testing
  const [canvasJson, setCanvasJson] = useState<string | null>(null);

  const [editMode, setEditMode] = useState<boolean>(false)
  

  useEffect(() => {
    if (canvasElRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasElRef.current, {
        backgroundColor: '#F0F8FF',
        width: 500,
        height: 500,
      });
      fabricCanvasRef.current = fabricCanvas;

      // Make canvas interactive
      fabricCanvas.selection = true;

      fabricCanvas.on('mouse:down', (e) => {
        const selectedObject = e.target as CustomFabricObject;
        if (selectedObject) {
          console.log('Object ID:', selectedObject.id); 
          // Perform other operations as needed
        }
      });
    }

    // Cleanup function to dispose the canvas when component unmounts
    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);


  const addCircle = () => {
    if (fabricCanvasRef.current) {
      const circle = new CustomCircle({
        radius: 50,
        fill: 'red',
        width: 50,
        height: 50,
        left: 100,
        top: 100,
        id: generateUniqueId(),
      });
      fabricCanvasRef.current.add(circle);
      fabricCanvasRef.current.renderAll(); 
    }
  };

  const addSquare = () => {
    if (fabricCanvasRef.current) {
      const square = new CustomRect({
        fill: 'green',
        width: 50,
        height: 50,
        left: 150, 
        top: 150, 
        id: generateUniqueId(),
      });
      fabricCanvasRef.current.add(square);
      fabricCanvasRef.current.renderAll();
    }
  };

  const saveCanvas = () => {
    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON();
      console.log(json);
        setCanvasJson(JSON.stringify(json));
    }
  }

  const loadCanvas = (canvasJson: string) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.loadFromJSON(canvasJson, () => {
        fabricCanvasRef.current?.renderAll();
      });
    }
  }

  // @ts-ignore
  const drawLines = (canvas: fabric.Canvas, points: fabric.Point[]) => {
    if (points.length < 2) return;
    for (let i = 0; i < points.length - 1; i++) {
      const line = new fabric.Line([points[i].x, points[i].y, points[i + 1].x, points[i + 1].y], {
        stroke: 'black',
        strokeWidth: 2,
        selectable: false,
      });
      canvas.add(line);
    }
  };

  const toggleEditMode = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.selection = !editMode;
      fabricCanvasRef.current.forEachObject(function (o) {
        o.selectable = !editMode;
      });
    }

    setEditMode(!editMode)
  }

  return (
    <div>
      <h1>Home</h1>
      <div className="floorplan__container">
        <div className="floorplan__editor">
          <h2>Editor</h2>
          <button type="button" onClick={toggleEditMode}>
            Edit mode: {editMode.toString()}
          </button>
          <button type="button" onClick={addCircle} disabled={!editMode}>
            Add circle
          </button>
          <button type="button" onClick={addSquare} disabled={!editMode}>
            Add square
          </button>
          <button type="button" onClick={saveCanvas}>
            Save canvas
          </button>
          <button type="button" onClick={() => loadCanvas(canvasJson || "")}>
            Load canvas
          </button>
          <div className="floorplan__editor-canvas">
            <canvas width="300" height="300" ref={canvasElRef}/>
          </div>
        </div>
        <div className="floorplan__desk-list">
          <h2>Desk list</h2>
          <ul>
                {desks.map((desk) => (
                <li key={desk.id}>
                    {desk.name}
                    {/* small italic text to show id */}
                    <br />
                    <small style={{ fontStyle: 'italic' }}>{desk.floorplanId ?? "No assigned location"}</small>
                </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default FloorplanEditor;

interface CustomFabricObject extends fabric.Object {
    id?: string;
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
