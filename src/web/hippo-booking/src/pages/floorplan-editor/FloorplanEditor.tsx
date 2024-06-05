import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import './FloorplanEditor.scss';

const generateUniqueId = () => {
  return uuidv4();
};

const assignableObjects: Array<AssignableObject> = [
  { id: generateUniqueId(), name: 'Desk 1', floorplanObjectId: undefined },
  { id: generateUniqueId(), name: 'Desk 2', floorplanObjectId: undefined },
  { id: generateUniqueId(), name: 'Desk 3', floorplanObjectId: undefined },
]

// TODO: How to draw lines
// TODO: Fetch desks from API

const FloorplanEditor = () => {
  // @ts-ignore
  const [desks, setDesks] = useState<Array<AssignableObject>>(assignableObjects);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [canvasJson, setCanvasJson] = useState<string | null>(null);

  const [editMode, setEditMode] = useState<boolean>(true)


  useEffect(() => {
    if (canvasElRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasElRef.current, {
        backgroundColor: '#F0F8FF',
        width: 800,
        height: 600,
      });
      fabricCanvasRef.current = fabricCanvas;

      // Make canvas interactive
      fabricCanvas.selection = true;

      fabricCanvas.on('mouse:down', (e) => {
        const selectedObject = e.target as CustomFabricObject;
        if (selectedObject) {
          // TODO: Only certain shapes we want to be classed as an assignable object (desk)
          console.log('Object ID:', selectedObject.id);
          setSelectedObject(selectedObject.id ?? null);
          // Perform other operations as needed
        } else {
          setSelectedObject(null)
        }

      });

      fabricCanvas.on('mouse:wheel', function(opt) {
        if (opt.e.altKey === true) {
          var delta = opt.e.deltaY;
          var zoom = fabricCanvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          fabricCanvas.setZoom(zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        }
      })

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
        width: 50,
        height: 50,
        left: 100,
        top: 100,
        fill: "white",
        stroke: 'black',
        strokeWidth: 2,
        id: generateUniqueId(),
      });
      fabricCanvasRef.current.add(circle);
      fabricCanvasRef.current.renderAll();
    }
  };

  const addSquare = () => {
    if (fabricCanvasRef.current) {
      const square = new CustomRect({
        width: 50,
        height: 50,
        left: 150,
        top: 150,
        fill: "white",
        stroke: 'black',
        strokeWidth: 2,
        id: generateUniqueId(),
      });
      fabricCanvasRef.current.add(square);
      fabricCanvasRef.current.renderAll();
    }
  };

  const saveCanvas = () => {
    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON(['id']);
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
      fabricCanvasRef.current.forEachObject(function(o) {
        o.selectable = !editMode;
      });
    }

    setEditMode(!editMode)
  }

  const assignDesk = (deskId: string) => {
    if (selectedObject) {
      console.log('selected desk', selectedObject);
      const nextDesks = desks.map(desk => {
        if(desk.id === deskId) {
          desk.floorplanObjectId = selectedObject;
        }
        return desk;
      })
      console.log('next desks', nextDesks)
      setDesks(nextDesks);
    }
  }


  const unassignDesk = (deskId: string) => {
    if (selectedObject) {
      console.log('selected desk', selectedObject);
      const nextDesks = desks.map(desk => {
        if(desk.id === deskId) {
          desk.floorplanObjectId = undefined;
        }
        return desk;
      })
      setDesks(nextDesks);
    }
  }

  return (
    <div>
      <h1>Floorplan editor</h1>
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
            <canvas width="800" height="600" ref={canvasElRef} />
          </div>
        </div>
        <div className="floorplan__desk-list">
          <h2>Bookable objects list</h2>
          <ul>
            {desks.map((desk) => (
              <li key={desk.id}>
                {desk.name}
                <br />
                <button type="button" onClick={() => assignDesk(desk.id)} disabled={!selectedObject}>Assign desk</button>
                <button type="button" onClick={() => unassignDesk(desk.id)} disabled={desk.floorplanObjectId === undefined}>Unassign desk</button>
                <br />
                <small style={{ fontStyle: 'italic' }}>{desk.floorplanObjectId ?? "No assigned location"}</small>
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
