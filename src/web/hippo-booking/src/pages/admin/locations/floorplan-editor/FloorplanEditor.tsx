import { fabric } from "fabric";
import { getLocationAreaAsync, putObjectsAsync, putLocationAsync } from "../../../../services/Apis";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  CustomCircle,
  CustomFabricObject,
  CustomRect,
} from "../../../../shared/fabric/CustomObjects";
import { ErrorBanner, SuccessBanner } from "../../../../components";
import {
  initializeCanvasZoom,
  initializeCanvasDragging,
  loadCanvas,
} from "../../../../shared/fabric/Canvas";

import "./FloorplanEditor.scss";
import { AccordionItem } from "../../../../components/accordion/Accordion";
import { isNullOrEmpty } from "../../../../helpers/StringHelpers";

const generateUniqueId = () => {
  return uuidv4();
};

interface SelectedObject {
  id: string;
  hasAssignedDesk: boolean;
}

const FloorplanEditor = () => {
  const { locationId, areaId } = useParams();
  const [area, setArea] = useState<Location>();
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [freeDrawMode, setFreeDrawMode] = useState<boolean>(false);
  const [textState, setTextState] = useState({hidden: true, text: ""});
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const queryClient = useQueryClient();
  
  const {isPending, error: locationError, data: locationData} = useQuery({
    queryKey: ['area-edit', locationId, areaId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId
  });


  const locationMutation = useMutation({
    mutationFn: (nextAreaData: Location) => putLocationAsync(locationId as string, nextAreaData, areaId as string),
  });

  const locationObjectsMutation = useMutation({
    mutationFn: (bookableObjects: BookableObject[]) => putObjectsAsync(locationId as string, areaId as string, bookableObjects),
  });

  useEffect(() => {
    if (locationData) {
      // Defensive in case API does not return empty array
      if(!locationData.bookableObjects){
        locationData.bookableObjects = [];
      }
      setArea(locationData);
    }
  }, [locationData]);

  useEffect(() => {
    if (canvasElRef.current) {
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef);

      // Make canvas interactive
      fabricCanvas.selection = true;

      fabricCanvas.on("mouse:down", (e) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
          if(selectedFabricObject.type === 'text') {
                    setTextState({hidden: false, text: (selectedFabricObject as fabric.Text).text ?? ""});
          }else {
            setTextState({hidden: true, text: ""});
           }

          // If there is no id, then it is not a bookable object
          if(selectedFabricObject.id) {
            setSelectedObject({id: selectedFabricObject.id, hasAssignedDesk: area?.bookableObjects.some(desk => desk.floorPlanObjectId === selectedFabricObject.id) ?? false});
          }
          // Perform other operations as needed
        } else {
          setSelectedObject(null);
        }
      });

      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas);
    }

    // Cleanup function to dispose the canvas when component unmounts
    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [locationData?.floorPlanJson, area?.bookableObjects]);

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
    if (selectedObject && area) {
      const nextDesks = area.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          desk.floorPlanObjectId = selectedObject.id;
        }
        return desk;
      });
      setArea({ ...area, bookableObjects: nextDesks });

      // change fill of object to green
      const object: CustomFabricObject | undefined = fabricCanvasRef.current?.getObjects().find((obj: CustomFabricObject) => obj.id === selectedObject.id);
      if (object) {
        object.set("fill", "green");
        fabricCanvasRef.current?.renderAll();
      }

    }
  };

  const unassignDesk = (deskId: number) => {
    if (selectedObject && area) {
      const nextDesks = area.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          desk.floorPlanObjectId = undefined;
        }
        return desk;
      });
      setArea({ ...area, bookableObjects: nextDesks });
      // change fill of object to white
      const object: CustomFabricObject | undefined = fabricCanvasRef.current?.getObjects().find((obj: CustomFabricObject) => obj.id === selectedObject.id);
      if (object) {
        object.set("fill", "white");
        fabricCanvasRef.current?.renderAll();
      }
    }
  };

  const saveLocation = async () => {
    if (area && fabricCanvasRef.current) {
      const nextLocation = {
        ...area,
        floorPlanJson: JSON.stringify(fabricCanvasRef.current.toJSON(["id"])),
      };
      Promise.all([
        locationMutation.mutateAsync(nextLocation),
        locationObjectsMutation.mutateAsync(area.bookableObjects),
      ]).finally(() => {
        if (locationId) {
          queryClient.invalidateQueries({
            queryKey: ['location', locationId],
          });
        }
      })
      window.scrollTo(0, 0);
    }
  };

  const removeObject = () => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        fabricCanvasRef.current.remove(activeObject);
        setTextState({hidden: true, text: ""});
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

  const handleAddText = () => {
    if (fabricCanvasRef.current) {
      const text = new fabric.Text("Hello, World!", {
        left: 100,
        top: 100,
        fill: "black",
      });
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.renderAll();
    }
  }

  const handleChangeText = (newText: string) => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
  
      if (activeObject && activeObject.type === 'text') {
        const textObject = activeObject as fabric.Text;
        textObject.text = newText;
        fabricCanvasRef.current.renderAll();
        setTextState({hidden: false, text: newText});
      }
    }
  };
  
  const handleLocationUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArea((prev) => {
              if (prev) {
                return {
                  ...prev,
                  name: e.target.value,
                };
              }
            });
  }

  const handleDeskUpdate = (
    text: string,
    deskId: number,
    field: 'name' | 'description'
  ) => {
    setArea((prev) => {
      if (prev) {
        return {
          ...prev,
          bookableObjects: prev.bookableObjects.map((d) => {
            if (d.id === deskId) {
              return {
                ...d,
                [field]: text,
              };
            }
            return d;
          }),
        };
      }
    });
  };

  /**
   * Finds the object in the canvas and selects it or deselects it if the floorPlanObjectId is null or undefined
   * @param floorPlanObjectId The id of the object to select
   */
  const handleSelectCanvasObject = (floorPlanObjectId?: string): void => {
    if (fabricCanvasRef.current && !isNullOrEmpty(floorPlanObjectId)) {
      const object: CustomFabricObject | undefined = fabricCanvasRef.current.getObjects().find((obj: CustomFabricObject) => obj.id === floorPlanObjectId);
      if (object) {
        fabricCanvasRef.current.setActiveObject(object as fabric.Object);
        fabricCanvasRef.current.renderAll();
        if(object.id) {
          const hasAssignedDesk = area?.bookableObjects.some(desk => desk.floorPlanObjectId === object.id);
          setSelectedObject({id: object.id, hasAssignedDesk: hasAssignedDesk ?? false});
        }
      }
    } else if (fabricCanvasRef.current && isNullOrEmpty(floorPlanObjectId)) {
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
    }
  }


  const hasErrors = locationError || locationMutation.isError || locationObjectsMutation.isError;
  const isLoading = isPending || locationMutation.isPending || locationObjectsMutation.isPending;
  const hasSuccess = locationMutation.isSuccess || locationObjectsMutation.isSuccess;

  // RENDERS
  // Must always have a canvas element, adding conditional logic to hide the canvas if the location is not loaded will break the fabric.js canvas
  return (
    <div className="page-container">
      <section className="full-width-standard-grey">
        <div className="content-container">
          <h1>{!area && isLoading ? "Location loading..." : area?.name}</h1>
          {hasErrors && <ErrorBanner />}
          {hasSuccess && <SuccessBanner text="Saved successfully" />}
          <div>
            <label htmlFor="location-name">Location name: </label>
            <input
              id="location-name"
              type="text"
              value={area?.name || ""}
              onChange={handleLocationUpdate}
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
              <button type="button" onClick={handleAddText}>Add text</button>

              <button type="button" onClick={removeObject} disabled={!editMode}>
                Remove object
              </button>

              <div className="canvas__container">
                <canvas width="800" height="600" ref={canvasElRef} />
              </div>
            </div>
            <div className="floorplan__desk-list">
              <h2>Bookable objects list</h2>
              <h3>Unassigned desks</h3>
              <ul>
              {area?.bookableObjects.filter(desk => isNullOrEmpty(desk.floorPlanObjectId)).map((desk) => (
                  <li key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
                    <AccordionItem  name={desk.name}>
                    <DeskListItem
                      desk={desk}
                      handleDeskUpdate={handleDeskUpdate}
                      assignDesk={assignDesk}
                      unassignDesk={unassignDesk}
                      selectedObject={selectedObject}
                    />
                  </AccordionItem>
                  </li>
                ))}
              </ul>
              <h3>Assigned desks</h3>
              <ul>
                {area?.bookableObjects.filter(desk => !isNullOrEmpty(desk.floorPlanObjectId)).map((desk) => (
                  <li  key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
                    <AccordionItem name={desk.name}>
                    <DeskListItem
                      desk={desk}
                      handleDeskUpdate={handleDeskUpdate}
                      assignDesk={assignDesk}
                      unassignDesk={unassignDesk}
                      selectedObject={selectedObject}
                    />
                  </AccordionItem>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={textState.hidden ? "hide-node" : ""}>
            <label>Text: </label>
            <input type="text" value={textState.text} onChange={(e) => handleChangeText(e.target.value)} />
          </div>
          <br />
          <button type="button" onClick={saveLocation}>
            Save location
          </button>
        </div>
      </section>
    </div>
  );
};

export default FloorplanEditor;

interface DeskListItemProps {
  desk: BookableObject;
  handleDeskUpdate: (value: string, id: number, field: 'name' | 'description') => void;
  assignDesk: (id: number) => void;
  unassignDesk: (id: number) => void;
  selectedObject: SelectedObject | null;
}

const DeskListItem: React.FC<DeskListItemProps> = ({
  desk,
  handleDeskUpdate,
  assignDesk,
  unassignDesk,
  selectedObject,
}) => (
  <section>
    <div className="floorplan__desk-list-card">
      <label htmlFor={`object-name=${desk.id}`}>Name: </label>
      <input
        id={`object-name=${desk.id}`}
        data-testid={`object-name-${desk.id}`}
        type="text"
        value={desk.name}
        onChange={(e) => handleDeskUpdate(e.target.value, desk.id, 'name')}
      />

      <label htmlFor={`object-description=${desk.id}`}>Description: </label>
      <textarea
        id={`desk-description=${desk.id}`}
        data-testid={`object-description-${desk.id}`}
        value={desk.description}
        onChange={(e) => handleDeskUpdate(e.target.value, desk.id, 'description')}
      />
      <button
        type="button"
        onClick={() => assignDesk(desk.id)}
        disabled={!selectedObject || selectedObject.hasAssignedDesk || !isNullOrEmpty(desk.floorPlanObjectId)}
      >
        Assign desk
      </button>
      <button
        type="button"
        onClick={() => unassignDesk(desk.id)}
        disabled={isNullOrEmpty(desk.floorPlanObjectId)}
      >
        Unassign desk
      </button>
    </div>
  </section>
);