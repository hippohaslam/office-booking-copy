import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import "./FloorplanEditor.scss";
import useFetch from "../../hooks/useFetchData";

const generateUniqueId = () => {
  return uuidv4();
};

// This is only while the backend is not implemented for saving desks
const assignableObjects: Array<BookableObject> = [
  { id: 1, name: "Desk 1", floorplanObjectId: undefined },
  { id: 2, name: "Desk 2", floorplanObjectId: undefined },
  { id: 3, name: "Desk 3", floorplanObjectId: undefined },
];

// TODO: How to draw lines
// TODO: Fetch desks from API

const FloorplanEditor = () => {
  let { officeId } = useParams();
  const [office, setOffice] = useState<Office>();
  const [postOffice, setPostOffice] = useState<Office | undefined>();
  const {data: officeData, isLoading: officeLoading, error: officeError } = useFetch<Office>(`https://localhost:7249/office/${officeId}`);
  const {success: updateSuccess} = useFetch<Office>(`https://localhost:7249/office/${officeId}`, 'PUT', undefined, postOffice);
  
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [editMode, setEditMode] = useState<boolean>(true);

  useEffect(() => {
    if(updateSuccess) {
      console.log('office updated')
    }
  } , [updateSuccess])

  useEffect(() => {
    
    if(officeData) {
      console.log('office data loading')
      officeData.bookableObjects = assignableObjects;
      setOffice(officeData);

      if (canvasElRef.current) {
        const fabricCanvas = loadCanvas(officeData?.floorPlanJson ?? "");
  
        // Make canvas interactive
        fabricCanvas.selection = true;
  
        fabricCanvas.on("mouse:down", (e) => {
          const selectedObject = e.target as CustomFabricObject;
          if (selectedObject) {
            // TODO: Only certain shapes we want to be classed as an assignable object (desk)
            console.log("Object ID:", selectedObject.id);
            setSelectedObject(selectedObject.id ?? null);
            // Perform other operations as needed
          } else {
            setSelectedObject(null);
          }
        });
  
        // Taken from the fabric docs
        fabricCanvas.on("mouse:wheel", function (opt) {
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
        });
      }
    }
    

    // Cleanup function to dispose the canvas when component unmounts
    return () => {
      console.log('cleaning up')
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [officeData]);

  const addCircle = () => {
    if (fabricCanvasRef.current) {
      console.log("Adding circle");
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
        stroke: "black",
        strokeWidth: 2,
        id: generateUniqueId(),
      });
      fabricCanvasRef.current.add(square);
      fabricCanvasRef.current.renderAll();
    }
  };

  const loadCanvas = (canvasJson: string) => {
    if(canvasJson === "") {
      const canvas = new fabric.Canvas(canvasElRef.current, {
        backgroundColor: "#F0F8FF",
        width: 800,
        height: 600,
      });
      fabricCanvasRef.current = canvas;
      return canvas;
    } else {
      const canvas =  new fabric.Canvas(canvasElRef.current).loadFromJSON(canvasJson, () => {
        fabricCanvasRef.current?.renderAll();
      });
      fabricCanvasRef.current = canvas;
      return canvas;
    }
  };

  // @ts-ignore
  const drawLines = (canvas: fabric.Canvas, points: fabric.Point[]) => {
    if (points.length < 2) return;
    for (let i = 0; i < points.length - 1; i++) {
      const line = new fabric.Line(
        [points[i].x, points[i].y, points[i + 1].x, points[i + 1].y],
        {
          stroke: "black",
          strokeWidth: 2,
          selectable: false,
        }
      );
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

    setEditMode(!editMode);
  };

  const assignDesk = (deskId: number) => {
    if (selectedObject && office) {
      console.log("selected desk", selectedObject);
      const nextDesks = office.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          desk.floorplanObjectId = selectedObject;
        }
        return desk;
      });
      console.log("next desks", nextDesks);
      setOffice({ ...office, bookableObjects: nextDesks });
    }
  };

  const unassignDesk = (deskId: number) => {
    if (selectedObject && office) {
      console.log("selected desk", selectedObject);
      const nextDesks = office.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          desk.floorplanObjectId = undefined;
        }
        return desk;
      });
      setOffice({ ...office, bookableObjects: nextDesks });
    }
  };

  const saveOffice = async () => {
    if (office && fabricCanvasRef.current) {
      const nextOffice = {
        ...office,
        floorPlanJson: JSON.stringify(fabricCanvasRef.current.toJSON(["id"])),
      };
      // use useFetch for API call
      setPostOffice(nextOffice);

    }
  };

  // RENDERS
  // Must always have a canvas element, adding conditional logic to hide the canvas if the office is not loaded will break the fabric.js canvas
  return (
    <div>
      <h1>{!office || officeLoading ? "Office loading..." : office.name}</h1>
      {officeError && <ErrorBanner />}
      <div>
        <h2>Office details</h2>
      </div>
      <h2>Desk assignment</h2>
      <div className="floorplan__container">
        <div className="floorplan__editor">
          <button type="button" onClick={toggleEditMode}>
            Edit mode: {editMode.toString()}
          </button>
          <button type="button" onClick={addCircle} disabled={!editMode}>
            Add circle
          </button>
          <button type="button" onClick={addSquare} disabled={!editMode}>
            Add square
          </button>
          <button type="button" onClick={saveOffice}>
            Save office
          </button>
          <div className="floorplan__editor-canvas">
            <canvas width="800" height="600" ref={canvasElRef} />
          </div>
        </div>
        <div className="floorplan__desk-list">
          <h2>Bookable objects list</h2>
          <ul>
            {office?.bookableObjects.map((desk) => (
              <li key={desk.id}>
                {desk.name}
                <br />
                <button
                  type="button"
                  onClick={() => assignDesk(desk.id)}
                  disabled={!selectedObject}
                >
                  Assign desk
                </button>
                <button
                  type="button"
                  onClick={() => unassignDesk(desk.id)}
                  disabled={desk.floorplanObjectId === undefined}
                >
                  Unassign desk
                </button>
                <br />
                <small style={{ fontStyle: "italic" }}>
                  {desk.floorplanObjectId ?? "No assigned location"}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FloorplanEditor;

// Move this
const ErrorBanner = () => {
  return (
    <div>
      <h1>Error</h1>
    </div>
  );
};

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
