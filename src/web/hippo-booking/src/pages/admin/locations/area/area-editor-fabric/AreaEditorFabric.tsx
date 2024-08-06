import { fabric } from "fabric";
import {
  getLocationAreaAsync,
  putObjectsAsync,
  putLocationAsync,
  postBookableObjectAsync,
} from "../../../../../services/Apis";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowSize } from "../../../../../hooks/WindowSizeHook";
import { CustomCircle, CustomFabricObject, CustomRect } from "../../../../../shared/fabric/CustomObjects";
import { ErrorBannerMultiple, SuccessBanner } from "../../../../../components";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../../../shared/fabric/Canvas";

import "./AreaEditorFabric.scss";
import { AccordionItem } from "../../../../../components/accordion/Accordion";
import { isNullOrEmpty } from "../../../../../helpers/StringHelpers";
import { CtaButton } from "../../../../../components/buttons/Buttons";

const generateUniqueId = () => {
  return uuidv4();
};

interface SelectedObject {
  id: string;
  hasAssignedDesk: boolean;
}

const errorKeys = {
  areaFetch: "area-fetch",
  areaSave: "area-save",
  saveFabricObjects: "save-fabric-objects",
  saveBookableObjects: "save-bookable-objects",
};

const FloorplanEditor = () => {
  const { locationId, areaId } = useParams();
  const [errors, setErrors] = useState<ErrorObjects[]>([]);
  const [area, setArea] = useState<BookingLocation>();
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [freeDrawMode, setFreeDrawMode] = useState<boolean>(false);
  const [textState, setTextState] = useState({ hidden: true, text: "" });
  const [newBookableObject, setNewBookableObject] = useState<BookableObject>({name: '', description: '', id: 0});
  const [showCreateNewBookableObject, setShowCreateNewBookableObject] = useState(false);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth } = useWindowSize();

  const queryClient = useQueryClient();

  const handleAddError = (key: string, message: string) => {
    setErrors([{ key, message }]);
  }

  const handleRemoveError = useCallback((key: string) => {
    setErrors(errors.filter((error) => error.key !== key));
  }, [errors]);

  const {isPending,data: locationData,isError,error} = useQuery({
    queryKey: ["area-edit", locationId, areaId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId,
  });

  useEffect(() => {
    if (isError && error) {
      handleAddError(errorKeys.areaFetch, "Failed to fetch area");
    } else {
      if(errors.some((error) => error.key === errorKeys.areaFetch)){
        handleRemoveError(errorKeys.areaFetch);
      }
    }
  }, [error, errors, handleRemoveError, isError]);
  

  const locationMutation = useMutation({
    mutationFn: (nextAreaData: BookingLocation) =>
      putLocationAsync(locationId as string, nextAreaData, areaId as string),
      onSuccess: () => {
        handleRemoveError(errorKeys.areaSave);
      },
      onError: () => handleAddError(errorKeys.areaSave, "Failed to save area"),
  });

  const locationObjectsMutation = useMutation({
    mutationFn: (bookableObjects: BookableObject[]) =>
      putObjectsAsync(locationId as string, areaId as string, bookableObjects),
      onSuccess: () => {
        handleRemoveError(errorKeys.saveBookableObjects);
      },
      onError: () => handleAddError(errorKeys.saveFabricObjects, "Error saving bookable objects"),
  });

  // Bit of a hack until I can think of how a better way.
  // We need to split the bookable objects out of the location data ideally. Not a showstopper though.
  const getBookableObjects = useMutation({
    mutationFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    onSuccess: (data) => {
      if (data) {
        const bookableObjects = data.bookableObjects ?? [];
        setArea((prev) => {
          if (prev) {
            return {...prev,bookableObjects: bookableObjects};
          }
        });
      }
    },
  })

  const createNewBookableOBjectMutation = useMutation({
    mutationFn: (bookableObject: BookableObject) => postBookableObjectAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), bookableObject),
    onSuccess: () => {
      setShowCreateNewBookableObject(false);
      handleRemoveError(errorKeys.saveBookableObjects);
      setNewBookableObject({name: '', description: '', id: 0});
      getBookableObjects.mutate();
    },
    onError: () => handleAddError(errorKeys.saveBookableObjects, "Error saving bookable objects"),
  });

  // Set the area data to the state
  useEffect(() => {
    if (locationData) {
      // Defensive in case API does not return empty array
      if (!locationData.bookableObjects) {
        locationData.bookableObjects = [];
      }
      setArea(locationData);
    }
  }, [locationData]);

  // Adjust canvas size based on window width
  useEffect(() => {
    if (fabricCanvasRef.current) {
      // < 900 and your on mobile/tablet so adjust canvas size
      if (windowWidth < 900) {
        fabricCanvasRef.current.setWidth(windowWidth - 100);
        fabricCanvasRef.current.setHeight(600);
      } else {
        fabricCanvasRef.current.setWidth(800);
        fabricCanvasRef.current.setHeight(600);
      }
    }
  }, [windowWidth]);

  // Add event listener to canvas to handle object selection
  useEffect(() => {
    if(fabricCanvasRef.current){
      fabricCanvasRef.current.on("mouse:down", (e) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
          if (selectedFabricObject.type === "text") {
            setTextState({ hidden: false, text: (selectedFabricObject as fabric.Text).text ?? "" });
          } else {
            setTextState({ hidden: true, text: "" });
          }
  
          // If there is no id, then it is not a bookable object
          if (selectedFabricObject.id) {
            setSelectedObject({
              id: selectedFabricObject.id,
              hasAssignedDesk:
                area?.bookableObjects.some((desk) => desk.floorPlanObjectId === selectedFabricObject.id) ?? false,
            });
          }
          // Perform other operations as needed
        } else {
          setSelectedObject(null);
        }
      });
    }
  }, [area?.bookableObjects])

  // Initialize the canvas
  useEffect(() => {
    
    if (canvasElRef.current && locationData) {
      const canvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600,
      };
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);

      // Make canvas interactive
      fabricCanvas.selection = true;

      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas, true);
    }

    // Cleanup function to dispose the canvas when component unmounts
    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [locationData]);

  const addCircle = () => {
    console.log('fabricCanvasRef.current', fabricCanvasRef.current)
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
      fabricCanvasRef.current.isDrawingMode = !fabricCanvasRef.current.isDrawingMode;
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
      const object: CustomFabricObject | undefined = fabricCanvasRef.current
        ?.getObjects()
        .find((obj: CustomFabricObject) => obj.id === selectedObject.id);
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
      const object: CustomFabricObject | undefined = fabricCanvasRef.current
        ?.getObjects()
        .find((obj: CustomFabricObject) => obj.id === selectedObject.id);
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
            queryKey: ["area-edit", locationId, areaId],
          });
        }
      });
      window.scrollTo(0, 0);
    }
  };

  const removeObject = () => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        fabricCanvasRef.current.remove(activeObject);
        setTextState({ hidden: true, text: "" });
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
  };

  const handleChangeText = (newText: string) => {
    if (fabricCanvasRef.current) {
      const activeObject = fabricCanvasRef.current.getActiveObject();

      if (activeObject && activeObject.type === "text") {
        const textObject = activeObject as fabric.Text;
        textObject.text = newText;
        fabricCanvasRef.current.renderAll();
        setTextState({ hidden: false, text: newText });
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
  };

  const handleDeskUpdate = (text: string, deskId: number, field: "name" | "description") => {
    setArea((prev) => {
      if (prev) {
        return {
          ...prev,
          bookableObjects: prev.bookableObjects.map((d) => {
            if (d.id === deskId) {
              return {...d,[field]: text,};
            }
            return d;
          }),
        };
      }
    });
  };

  const handleCopy = () => {
    // This was a bit tricky to implement, but the idea is to clone the selected objects and add them to the canvas, then reselect because fabric...
    // I had to discardActiveObject then setActiveObject to make the objects selectable again without losing left and top positions
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      fabricCanvasRef.current.discardActiveObject();
      const forSelect: CustomFabricObject[] = [];
      if (activeObjects && activeObjects.length > 0) {
        activeObjects.forEach((activeObject: CustomFabricObject) => {
          activeObject.clone((cloned: CustomFabricObject) => {
            const id = generateUniqueId();
            cloned.set("id", id);
            cloned.set("left", activeObject?.left ? activeObject.left + 10 : 150);
            cloned.set("top", activeObject?.top ? activeObject.top + 10 : 150);
            forSelect.push(cloned);
            fabricCanvasRef.current?.add(cloned);
          });
        });
        fabricCanvasRef.current.setActiveObject(
          new fabric.ActiveSelection(forSelect, {
            canvas: fabricCanvasRef.current,
          })
        );
      }
      fabricCanvasRef.current.renderAll();
    }
  };

  /**
   * Finds the object in the canvas and selects it or deselects it if the floorPlanObjectId is null or undefined
   * @param floorPlanObjectId The id of the object to select
   */
  const handleSelectCanvasObject = (floorPlanObjectId?: string): void => {
    if (fabricCanvasRef.current && !isNullOrEmpty(floorPlanObjectId)) {
      const object: CustomFabricObject | undefined = fabricCanvasRef.current
        .getObjects()
        .find((obj: CustomFabricObject) => obj.id === floorPlanObjectId);
      if (object) {
        fabricCanvasRef.current.setActiveObject(object as fabric.Object);
        fabricCanvasRef.current.renderAll();
        if (object.id) {
          const hasAssignedDesk = area?.bookableObjects.some((desk) => desk.floorPlanObjectId === object.id);
          setSelectedObject({ id: object.id, hasAssignedDesk: hasAssignedDesk ?? false });
        }
      }
    } else if (fabricCanvasRef.current && isNullOrEmpty(floorPlanObjectId)) {
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
    }
  };

  const handleAddNewBookableObject = () => createNewBookableOBjectMutation.mutate(newBookableObject);
  const handleAddNewBookableObjectDisplay = () => setShowCreateNewBookableObject(!showCreateNewBookableObject);

  const isLoading = isPending || locationMutation.isPending || locationObjectsMutation.isPending;
  const hasSuccess = locationMutation.isSuccess || locationObjectsMutation.isSuccess;

  // RENDERS
  // Must always have a canvas element, adding conditional logic to hide the canvas if the location is not loaded will break the fabric.js canvas
  return (
    <div className="content-container">
      <h1>{!area && isLoading ? "Location loading..." : area?.name}</h1>
      {errors.length > 0 && <ErrorBannerMultiple errors={errors} />}
      {hasSuccess && errors.length < 1 && <SuccessBanner text="Saved successfully" />}
      <div>
        <label htmlFor="location-name">Location name: </label>
        <input id="location-name" type="text" value={area?.name || ""} onChange={handleLocationUpdate} />
      </div>
      <br />
      <div>
      <CtaButton type="button" text="Save changes" color="cta-green" onClick={saveLocation} />
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
          <button type="button" onClick={handleAddText}>
            Add text
          </button>

          <button type="button" onClick={removeObject} disabled={!editMode}>
            Remove object
          </button>
          <button type="button" onClick={handleCopy}>
            Copy
          </button>

          <div className="canvas__container">
            <canvas width={800} height={600} ref={canvasElRef} />
          </div>
        </div>

        <div className="floorplan__desk-list">
          <h2>Bookable objects list</h2>
          <button type="button" onClick={handleAddNewBookableObjectDisplay}>
            Create a new bookable object
          </button>
          {showCreateNewBookableObject ? (
            <div>
              <div>
                <label htmlFor="new-bookable-object-name">Name: </label>
                <input 
                  type="text" 
                  name="new-bookable-object-name" 
                  value={newBookableObject.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBookableObject({...newBookableObject, name: e.target.value})} />
              </div>
              <div>
                <label htmlFor="new-bookable-object-description">Description: </label>
                <input 
                  type="text" 
                  name="new-bookable-object-description"
                  value={newBookableObject.description} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBookableObject({...newBookableObject, description: e.target.value})} />
              </div>
              <button type="button" onClick={handleAddNewBookableObject}>Create</button>
            </div>
          ) : null}
          <h3>Unassigned places</h3>
          {area && area.bookableObjects.filter((desk) => isNullOrEmpty(desk.floorPlanObjectId)).length < 1 && (
            <p>No unassigned places</p>
          )}
          <ul>
            {area?.bookableObjects
              .filter((desk) => isNullOrEmpty(desk.floorPlanObjectId))
              .map((desk) => (
                <li key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
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
          <h3>Assigned places</h3>
          {area && area.bookableObjects.filter((desk) => !isNullOrEmpty(desk.floorPlanObjectId)).length < 1 && (
            <p>No assigned places</p>
          )}
          <ul>
            {area?.bookableObjects
              .filter((desk) => !isNullOrEmpty(desk.floorPlanObjectId))
              .map((desk) => (
                <li key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
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
      
    </div>
  );
};

export default FloorplanEditor;

interface DeskListItemProps {
  desk: BookableObject;
  handleDeskUpdate: (value: string, id: number, field: "name" | "description") => void;
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
        onChange={(e) => handleDeskUpdate(e.target.value, desk.id, "name")}
      />

      <label htmlFor={`object-description=${desk.id}`}>Description: </label>
      <textarea
        id={`desk-description=${desk.id}`}
        data-testid={`object-description-${desk.id}`}
        value={desk.description}
        onChange={(e) => handleDeskUpdate(e.target.value, desk.id, "description")}
      />
      <button
        type="button"
        onClick={() => assignDesk(desk.id)}
        disabled={!selectedObject || selectedObject.hasAssignedDesk || !isNullOrEmpty(desk.floorPlanObjectId)}
      >
        Assign desk
      </button>
      <button type="button" onClick={() => unassignDesk(desk.id)} disabled={isNullOrEmpty(desk.floorPlanObjectId)}>
        Unassign desk
      </button>
    </div>
  </section>
);
