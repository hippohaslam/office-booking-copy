import { fabric } from "fabric";
import { fetchOfficeAsync, putObjectsAsync, putOfficeAsync } from "../../services/Apis";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {useQuery} from '@tanstack/react-query';
import {
  CustomCircle,
  CustomFabricObject,
  CustomRect,
} from "../../shared/fabric/CustomObjects";
import { ErrorBanner, SuccessBanner } from "../../components/banners/Banners";
import {
  initializeCanvasZoom,
  initializeCanvasDragging,
} from "../../shared/fabric/Canvas";

import "./FloorplanEditor.scss";

const generateUniqueId = () => {
  return uuidv4();
};

const FloorplanEditor = () => {
  const { officeId } = useParams();
  const [office, setOffice] = useState<Office>();
  const [postOffice, setPostOffice] = useState<Office | undefined>();
  
  const {isPending, error: officeError, data: officeData} = useQuery({
    queryKey: ['office'],
    queryFn: () => fetchOfficeAsync(officeId as string),
    enabled: !!officeId
  });
  
  const {isPending: isUpdatePending, error: putUpdateError, isSuccess} = useQuery({
    queryKey: ['office-update'],
    queryFn: () => putOfficeAsync(postOffice as Office),
    enabled: !!postOffice
  });

  const {isPending: isUpdateObjectsPending, error: putUpdateObjectsError, isSuccess: isUpdateObjectsSuccess} = useQuery({
    queryKey: ['office-objects-update'],
    queryFn: () => putObjectsAsync(officeId as string, postOffice?.bookableObjects as BookableObject[]),
    enabled: !!postOffice && !!postOffice.bookableObjects
  });

  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [editMode, setEditMode] = useState<boolean>(true);
  const [freeDrawMode, setFreeDrawMode] = useState<boolean>(false);

  useEffect(() => {
    if (officeData) {
      setOffice(officeData);

      if (canvasElRef.current) {
        const fabricCanvas = loadCanvas(officeData?.floorPlanJson ?? "");

        // Make canvas interactive
        fabricCanvas.selection = true;

        fabricCanvas.on("mouse:down", (e) => {
          const selectedObject = e.target as CustomFabricObject;
          if (selectedObject) {
            // TODO: Only certain shapes we want to be classed as an assignable object (cirle, square, etc.)
            console.log("Object ID:", selectedObject.id);
            setSelectedObject(selectedObject.id ?? null);
            // Perform other operations as needed
          } else {
            setSelectedObject(null);
          }
        });

        initializeCanvasZoom(fabricCanvas);
        initializeCanvasDragging(fabricCanvas);
      }
    }

    // Cleanup function to dispose the canvas when component unmounts
    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [officeData]);

  const addCircle = () => {
    if (fabricCanvasRef.current) {
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
    if (canvasJson === "") {
      const canvas = new fabric.Canvas(canvasElRef.current, {
        backgroundColor: "#F0F8FF",
        width: 800,
        height: 600,
      });
      fabricCanvasRef.current = canvas;
      return canvas;
    } else {
      const canvas = new fabric.Canvas(canvasElRef.current).loadFromJSON(
        canvasJson,
        () => {
          fabricCanvasRef.current?.renderAll();
        }
      );
      fabricCanvasRef.current = canvas;
      return canvas;
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

  const toggleFreeDraw = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode =
        !fabricCanvasRef.current.isDrawingMode;
    }
    setFreeDrawMode(!freeDrawMode);
  };

  const assignDesk = (deskId: number) => {
    if (selectedObject && office) {
      const nextDesks = office.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          desk.floorplanObjectId = selectedObject;
        }
        return desk;
      });
      setOffice({ ...office, bookableObjects: nextDesks });
    }
  };

  const unassignDesk = (deskId: number) => {
    if (selectedObject && office) {
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

      // scroll window top;
      window.scrollTo(0, 0);
    }
  };

  const removeObject = () => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        fabricCanvasRef.current.remove(activeObject);
      }
    }
  };

  const handleLineDraw = () => {
    if (fabricCanvasRef.current) {
      const line = new fabric.Line([100, 800, 100, 600], {
        left: 170,
        top: 150,
        stroke: "black",
        strokeWidth: 20,
      });
      fabricCanvasRef.current.add(line);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleDeskUpdate = (
    e: React.ChangeEvent<HTMLInputElement>,
    deskId: number
  ) => {
    setOffice((prev) => {
      if (prev) {
        return {
          ...prev,
          bookableObjects: prev.bookableObjects.map((d) => {
            if (d.id === deskId) {
              return {
                ...d,
                name: e.target.value,
              };
            }
            return d;
          }),
        };
      }
    });
  };

  const hasErrors = officeError || putUpdateError;
  const isLoading = isPending || isUpdatePending || isUpdateObjectsPending;

  // RENDERS
  // Must always have a canvas element, adding conditional logic to hide the canvas if the office is not loaded will break the fabric.js canvas
  return (
    <div>
      <h1>{!office && isLoading ? "Office loading..." : office?.name}</h1>
      {hasErrors && <ErrorBanner />}
      {isSuccess && <SuccessBanner text="Saved successfully" />}
      <div>
        <label htmlFor="office-name">Office name: </label>
        <input
          id="office-name"
          type="text"
          value={office?.name || ""}
          onChange={(e) => {
            setOffice((prev) => {
              if (prev) {
                return {
                  ...prev,
                  name: e.target.value,
                };
              }
            });
          }}
        />
      </div>
      <br />
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
          <button type="button" onClick={handleLineDraw} disabled={!editMode}>
            Add line
          </button>
          <button type="button" onClick={toggleFreeDraw} disabled={!editMode}>
            Free draw mode: {freeDrawMode.toString()}
          </button>

          <button type="button" onClick={removeObject} disabled={!editMode}>
            Remove object
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
                <input
                  data-testid={`edit-id-${desk.id}`}
                  type="text"
                  value={desk.name}
                  onChange={(e) => {
                    handleDeskUpdate(e, desk.id);
                  }}
               />
                <br />
                <small>{desk.description}</small>
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
      <button type="button" onClick={saveOffice}>
        Save office
      </button>
    </div>
  );
};

export default FloorplanEditor;