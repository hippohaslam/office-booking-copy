import "./AreaEditorFabric.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { fabric } from "fabric";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getLocationAreaAsync, putObjectsAsync, putAreaAsync, postBookableObjectAsync, editObjectAsync } from "../../../../../services/Apis";
import { useWindowSize } from "../../../../../hooks/WindowSizeHook";
import { CustomCircle, CustomFabricObject, CustomGroup, CustomObject, CustomRect } from "../../../../../shared/fabric/CustomObjects";
import { ActionTable, Breadcrumbs, ConfirmModal, IconButton, MultiErrorBanner, SuccessBanner } from "../../../../../components";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../../../shared/fabric/Canvas";
import { AccordionGroup, AccordionItem } from "../../../../../components/accordion/Accordion";
import { isNullOrEmpty } from "../../../../../helpers/StringHelpers";
import { CtaButton } from "../../../../../components/buttons/CtaButton";
import { Area } from "../../../../../interfaces/Area";
import type { BookableObject } from "../../../../../interfaces/Desk";
import { BookableObjectTypeEnum } from "../../../../../enums/BookableObjectTypeEnum";
import EnumSelect from "../../../../../components/select/EnumSelect";

import GetSvgEditorAssets, { SvgAsset } from "../../../../../services/AssetFiles";
import SelectModal from "../../../../../components/modals/select/SelectModal";

import CircleIcon from "../../../../../assets/circle-icon.svg";
import SquareIcon from "../../../../../assets/square-icon.svg";
import AddLineIcon from "../../../../../assets/line-icon.svg";
import FreeDrawIcon from "../../../../../assets/edit-mode-icon.svg";
import FreeDrawOffIcon from "../../../../../assets/edit-off-icon.svg";
import TextIcon from "../../../../../assets/text-icon.svg";
import DeleteIcon from "../../../../../assets/delete-icon.svg";
import DuplicateIcon from "../../../../../assets/copy-icon.svg";
import SendToBackIcon from "../../../../../assets/bring-to-back-icon.svg";
import SendToFrontIcon from "../../../../../assets/bring-to-front-icon.svg"
import ImageIcon from "../../../../../assets/image-icon.svg";
import EditIcon from "../../../../../assets/edit-icon.svg";
import AddIcon from "../../../../../assets/add-icon.svg";
import AssignIcon from "../../../../../assets/assign-icon.svg";

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

const defaultNewBookableObject: BookableObject = {
  name: "",
  description: "",
  id: 0,
  bookableObjectTypeId: BookableObjectTypeEnum.Standard,
};

const FloorplanEditor = () => {
  const { locationId, areaId } = useParams();
  const [errors, setErrors] = useState<ErrorObjects[]>([]);
  const [area, setArea] = useState<Area>();
  const [urlSvgs] = useState<SvgAsset[]>(GetSvgEditorAssets());
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [freeDrawMode, setFreeDrawMode] = useState<boolean>(false);
  const [textState, setTextState] = useState({ hidden: true, text: "" });
  const [newBookableObject, setNewBookableObject] = useState<BookableObject>(defaultNewBookableObject);
  const [showCreateNewBookableObject, setShowCreateNewBookableObject] = useState(false);
  const [showSvgSelectModal, setShowSvgSelectModal] = useState(false);
  const [bookableObjectToEdit, setBookableObjectToEdit] = useState<BookableObject | null>(null);
  const [disableObjectTools, setDisableObjectTools] = useState(true);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth } = useWindowSize();
  const objectToolsRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const handleAddError = (key: string, message: string) => {
    setErrors([{ key, message }]);
  };

  const handleRemoveError = useCallback(
    (key: string) => {
      setErrors(errors.filter((error) => error.key !== key));
    },
    [errors],
  );

  const {
    data: locationData,
    isError,
    error,
  } = useQuery({
    queryKey: ["area-edit", locationId, areaId],
    queryFn: () => getLocationAreaAsync(true)(locationId as string, areaId as string),
    enabled: !!locationId,
  });

  useEffect(() => {
    if (isError && error) {
      handleAddError(errorKeys.areaFetch, "Failed to fetch area");
    } else {
      if (errors.some((error) => error.key === errorKeys.areaFetch)) {
        handleRemoveError(errorKeys.areaFetch);
      }
    }
  }, [error, errors, handleRemoveError, isError]);

  const areaMutation = useMutation({
    mutationFn: (nextAreaData: Area) => putAreaAsync(locationId as string, nextAreaData, areaId as string),
    onSuccess: () => {
      handleRemoveError(errorKeys.areaSave);
    },
    onError: () => handleAddError(errorKeys.areaSave, "Failed to save area"),
  });

  const bookableObjectsMutation = useMutation({
    mutationFn: (bookableObjects: BookableObject[]) => putObjectsAsync(locationId as string, areaId as string, bookableObjects),
    onSuccess: () => {
      handleRemoveError(errorKeys.saveBookableObjects);
    },
    onError: () => handleAddError(errorKeys.saveFabricObjects, "Error saving bookable objects"),
  });

  // Bit of a hack until I can think of how a better way.
  // We need to split the bookable objects out of the location data ideally. Not a showstopper though.
  const getBookableObjects = useMutation({
    mutationFn: () => getLocationAreaAsync(true)(locationId as string, areaId as string),
    onSuccess: (data) => {
      if (data) {
        const bookableObjects = data.bookableObjects ?? [];
        setArea((prev) => {
          if (prev) {
            return { ...prev, bookableObjects: bookableObjects };
          }
        });
      }
    },
  });

  /** Resets to default values and closes the input box */
  const resetNewBookableObject = () => {
    setShowCreateNewBookableObject(false);
    setNewBookableObject(defaultNewBookableObject);
  };

  const handleCancelUpdateExistingBookableObject = () => {
    setBookableObjectToEdit(null);
  };

  const createNewBookableOBjectMutation = useMutation({
    mutationFn: (bookableObject: BookableObject) =>
      postBookableObjectAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), bookableObject),
    onSuccess: () => {
      handleRemoveError(errorKeys.saveBookableObjects);
      resetNewBookableObject();
      getBookableObjects.mutate();
    },
    onError: () => handleAddError(errorKeys.saveBookableObjects, "Error saving bookable objects"),
  });

  const updateExistingBookableObjectMutation = useMutation({
    mutationFn: (bookableObject: BookableObject) => 
      editObjectAsync(locationId!, areaId!, bookableObject),
    onSuccess: () => {
      handleRemoveError(errorKeys.saveBookableObjects);
      getBookableObjects.mutate();
      setBookableObjectToEdit(null);
    },
    onError: () => handleAddError(errorKeys.saveBookableObjects, "Error saving bookable object"),
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
      fabricCanvasRef.current.setWidth(canvasWidth());
      fabricCanvasRef.current.setHeight(600);
    }
  }, [windowWidth]);

  const canvasWidth = () => {
    if (windowWidth < 1150) {
      return windowWidth - 50;
    }
    if (windowWidth < 1513) {
      return windowWidth - 420;
    }
    else {
      return 1092;
    }
  }

  // Add event listener to canvas to handle object selection
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.on("mouse:down", (e) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
          if (selectedFabricObject.type === "text") {
            setTextState({ hidden: false, text: (selectedFabricObject as fabric.Text).text ?? "" });
          } else {
            setTextState({ hidden: true, text: "" });
          }
          setDisableObjectTools(false);

          // If there is no id, then it is not a bookable object
          if (selectedFabricObject.id) {
            setSelectedObject({
              id: selectedFabricObject.id,
              hasAssignedDesk: area?.bookableObjects.some((desk) => desk.floorPlanObjectId === selectedFabricObject.id) ?? false,
            });
          }
          // Perform other operations as needed
        } else {
          setSelectedObject(null);
          setDisableObjectTools(true);
          setTextState({ hidden: true, text: "" });
        }
      });
    }
  }, [area?.bookableObjects]);

  useEffect(() => {
    if (objectToolsRef.current) {
      let buttons = objectToolsRef.current.children;
      for (let button of buttons) {
        button.setAttribute("aria-disabled", `${disableObjectTools}`)
      }
    }
  }, [disableObjectTools])

  // Initialize the canvas
  useEffect(() => {
    if (canvasElRef.current && locationData) {
      const canvasOptions = {
        backgroundColor: "white",
        width: canvasWidth(),
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
    if (area) {
      let selectedObjectId : number = 0;
      const nextDesks = area.bookableObjects.map((desk) => {
        if (desk.id === deskId) {
          selectedObjectId = desk.floorPlanObjectId;
          desk.floorPlanObjectId = undefined;
        }
        return desk;
      });
      setArea({ ...area, bookableObjects: nextDesks });
      // change fill of object to white
      const object: CustomFabricObject | undefined = fabricCanvasRef.current
        ?.getObjects()
        .find((obj: CustomFabricObject) => obj.id === selectedObjectId.toString());
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
      Promise.all([areaMutation.mutateAsync(nextLocation), bookableObjectsMutation.mutateAsync(area.bookableObjects)]).finally(() => {
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
    if (!disableObjectTools) {
      if (fabricCanvasRef.current) {
        const activeObject = fabricCanvasRef.current.getActiveObject() as CustomObject;

        if (activeObject) {
          if (!isNullOrEmpty(activeObject.id) && area) {
            const nextDesks = area.bookableObjects.map((desk) => {
              if (desk.floorPlanObjectId === activeObject.id) {
                desk.floorPlanObjectId = undefined;
              }
              return desk;
            });
            setArea({ ...area, bookableObjects: nextDesks });
          }

          fabricCanvasRef.current.remove(activeObject);
          setTextState({ hidden: true, text: "" });
        }
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
        fontFamily: '"DM Sans","serif"',
      });
      text.bringForward();
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

  const handleCopy = () => {
    // This was a bit tricky to implement, but the idea is to clone the selected objects and add them to the canvas, then reselect because fabric...
    // I had to discardActiveObject then setActiveObject to make the objects selectable again without losing left and top positions
    if (!disableObjectTools) {
      if (fabricCanvasRef.current) {
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        fabricCanvasRef.current.discardActiveObject();
        const forSelect: CustomFabricObject[] = [];
        if (activeObjects && activeObjects.length > 0) {
          activeObjects.forEach((activeObject: CustomFabricObject) => {
            activeObject.clone((cloned: CustomFabricObject) => {
              const newId = generateUniqueId();
              // Only generate a new id if the original object has an id
              if (!isNullOrEmpty(activeObject.id)) {
                cloned.set("id", newId);
              }
              cloned.set("left", activeObject?.left ? activeObject.left + 10 : 150);
              cloned.set("top", activeObject?.top ? activeObject.top + 10 : 150);
              forSelect.push(cloned);
              fabricCanvasRef.current?.add(cloned);
            });
          });
          fabricCanvasRef.current.setActiveObject(
            new fabric.ActiveSelection(forSelect, {
              canvas: fabricCanvasRef.current,
            }),
          );
        }
        fabricCanvasRef.current.renderAll();
      }
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

  const handleSendToPosition = (position: "back" | "front") => {
    if (!disableObjectTools) {
      if (fabricCanvasRef.current) {
        const activeObject = fabricCanvasRef.current.getActiveObject();
        if (activeObject) {
          if (position === "back") {
            fabricCanvasRef.current.sendToBack(activeObject);
          } else if (position === "front") {
            fabricCanvasRef.current.bringToFront(activeObject);
          }
          fabricCanvasRef.current.discardActiveObject();
          fabricCanvasRef.current.renderAll();
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fabricCanvasRef.current && e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (data) {
          fabric.loadSVGFromString(data as string, (objects) => {
            const group = new fabric.Group(objects as CustomObject[]) as CustomGroup;
            group.set("id", generateUniqueId());
            fabricCanvasRef.current?.add(group);
            fabricCanvasRef.current?.renderAll();
          });
        }
      };
      reader.readAsText(file);
      // clear the file input when finished
      e.target.value = "";
      setShowSvgSelectModal(false);
    }
  };

  const handleSvgUrlUploadModal = (url: string) => {
    if (fabricCanvasRef.current) {
      fabric.loadSVGFromURL(url, (objects) => {
        const group = new fabric.Group(objects as CustomObject[]) as CustomGroup;
        group.set("id", generateUniqueId());
        fabricCanvasRef.current?.add(group);
        fabricCanvasRef.current?.renderAll();
      });
    }
    setShowSvgSelectModal(false);
  };

  const hasSuccess = areaMutation.isSuccess || bookableObjectsMutation.isSuccess;

  const newBookableObjectModal = () => {
    return (
      <ConfirmModal 
        isOpen={true} 
        title="Create a new bookable object" 
        showConfirmButton 
        confirmButtonLabel="Create bookable object" 
        cancelButtonLabel="Cancel" 
        childElement={
          <>
            <div className='standard-inputs'>
              <label htmlFor='new-bookable-object-name'>Name: </label>
              <input
                id='new-bookable-object-name'
                type='text'
                name='new-bookable-object-name'
                value={newBookableObject.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewBookableObject({ ...newBookableObject, name: e.target.value })
                }
              />
            </div>
            <div className='standard-inputs'>
              <label htmlFor='new-bookable-object-description'>Description: </label>
              <input
                id='new-bookable-object-description'
                type='text'
                name='new-bookable-object-description'
                value={newBookableObject.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewBookableObject({ ...newBookableObject, description: e.target.value })
                }
              />
            </div>
            <div className='standard-inputs'>
              <label htmlFor='new-bookable-object-type'>Type: </label>
              <EnumSelect
                enumObj={BookableObjectTypeEnum}
                value={newBookableObject.bookableObjectTypeId.toString()}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewBookableObject({ ...newBookableObject, bookableObjectTypeId: Number.parseInt(e.target.value) })
                }
                name='new-bookable-object-type'
              />
            </div>
          </>
        }
        onConfirm={handleAddNewBookableObject}
        onCancel={resetNewBookableObject}>
      </ConfirmModal>
  )};

  const handleUpdateExistingBookableObject = () => bookableObjectToEdit && updateExistingBookableObjectMutation.mutate(bookableObjectToEdit);

  const updateExistingBookableObjectModal = () => {
    if (bookableObjectToEdit != null) {
      return (
      <>
        <ConfirmModal
          isOpen={true}
          title='Edit bookable object'
          showConfirmButton
          confirmButtonLabel='Save changes'
          cancelButtonLabel='Cancel and discard changes'
          childElement={
            <>
              <div className='standard-inputs'>
                <label htmlFor='new-bookable-object-name'>Name: </label>
                <input
                  id='new-bookable-object-name'
                  type='text'
                  name='new-bookable-object-name'
                  value={bookableObjectToEdit.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBookableObjectToEdit({ ...bookableObjectToEdit, name: e.target.value })
                  }
                />
              </div>
              <div className='standard-inputs'>
                <label htmlFor='new-bookable-object-description'>Description: </label>
                <input
                  id='new-bookable-object-description'
                  type='text'
                  name='new-bookable-object-description'
                  value={bookableObjectToEdit.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBookableObjectToEdit({ ...bookableObjectToEdit, description: e.target.value })
                  }
                />
              </div>
              <div className='standard-inputs'>
                <label htmlFor='new-bookable-object-type'>Type: </label>
                <EnumSelect
                  enumObj={BookableObjectTypeEnum}
                  value={bookableObjectToEdit.bookableObjectTypeId.toString()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setBookableObjectToEdit({ ...bookableObjectToEdit, bookableObjectTypeId: Number.parseInt(e.target.value) })
                  }
                  name='new-bookable-object-type'
                />
              </div>
            </>
          }
          onCancel={handleCancelUpdateExistingBookableObject}
          onConfirm={handleUpdateExistingBookableObject}>
        </ConfirmModal>
      </>
    )}
  };

  const unassignedBookableObjects = (area && area.bookableObjects.filter((desk) => isNullOrEmpty(desk.floorPlanObjectId)));
  const assignedBookableObjects = (area && area.bookableObjects.filter((desk) => !isNullOrEmpty(desk.floorPlanObjectId)));
  const breadcrumbItems = [
    { to: '/admin', text: 'Admin' }, 
    { to: '', text: 'Edit area' }
  ];

  // RENDERS
  // Must always have a canvas element, adding conditional logic to hide the canvas if the location is not loaded will break the fabric.js canvas
  return (
    <>
      <SelectModal title='Add an image' isOpen={showSvgSelectModal} onClose={() => setShowSvgSelectModal(false)}>
        <>
          <h3>Common images</h3>
          {urlSvgs.length > 0 ? (
            urlSvgs.map((asset) => (
              <img
                height={100}
                width={100}
                key={asset.name}
                src={asset.path}
                alt={asset.name}
                className='clickable hover-border'
                onClick={() => handleSvgUrlUploadModal(asset.path)}
              />
            ))
          ) : (
            <p>No images available</p>
          )}
          <h3>Upload image</h3>
          <div>
            <label htmlFor='svg-upload'>Upload an SVG file from your device: </label>
            <input type='file' name='svg-upload' accept='image/svg+xml' onChange={handleFileUpload} />
          </div>
          <br/>
        </>
      </SelectModal>

      {errors.length > 0 && <MultiErrorBanner isShown={errors.length > 0} title='Error' errors={errors} allowClose={true} />}
      {hasSuccess && errors.length < 1 && <SuccessBanner isShown={hasSuccess} title='Saved successfully' />}
      <Breadcrumbs items={breadcrumbItems}/>
      <h1>Edit area</h1>
      <h2>Details</h2>
      <div className='standard-inputs'>
        <label htmlFor='area-name'>Area name</label>
        <input id='area-name' type='text' value={area?.name || ""} onChange={handleLocationUpdate} />
      </div>
      <br/>
      <div>
        <h2>Manage bookable objects</h2>
        <ActionTable title='Bookable objects (places)' columnHeadings={['Name', 'Type', 'Description', 'Action']} rows={
          <>
            {area?.bookableObjects.length && area?.bookableObjects.length > 0 ? area?.bookableObjects.map((object) => (
              <tr key={object.id}>
                <td>{object.name}</td>
                <td>{object.bookableObjectTypeId.toString() == '1' ? 'Standard' : 'Dog'}</td>
                <td>{object.description}</td>
                <td>
                  <IconButton title='Edit bookable object' iconSrc={EditIcon} onClick={() => setBookableObjectToEdit(object)} color="navy" showBorder={false} showText={false}/>
                </td>
              </tr>
            )) : <tr><td>There are currently no bookable objects for this area 😔</td></tr>}
          </>
        }/>
        <IconButton title='Create new bookable object' iconSrc={AddIcon} onClick={handleAddNewBookableObjectDisplay} color="navy" showBorder={true} showText={true}/>
        {showCreateNewBookableObject ? (newBookableObjectModal()) : null}
        {bookableObjectToEdit ? (updateExistingBookableObjectModal()) : null}
      </div>
      <br/>
      <h2>Manage floorplan</h2>
      <div className='floorplan__container'>
        <div className='floorplan__editor'>
          <div className='toolbar'>
            <div className='toolbar-button-group'>
              <IconButton title='Add circle' iconSrc={CircleIcon} onClick={addCircle} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Add square' iconSrc={SquareIcon} onClick={addSquare} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Add line' iconSrc={AddLineIcon} onClick={handleLineDraw} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Add text' iconSrc={TextIcon} onClick={handleAddText} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Add image' iconSrc={ImageIcon} onClick={() => setShowSvgSelectModal(true)} color='grey' showBorder={false} showText={false}/>
            </div>
            <div className='toolbar-button-group'>
              <IconButton title={'Free draw mode: ' + freeDrawMode.toString()} iconSrc={freeDrawMode == true ?  FreeDrawOffIcon : FreeDrawIcon} onClick={toggleFreeDraw} color="grey" showBorder={false} showText={false}/>
            </div>
            <div className='toolbar-button-group' ref={objectToolsRef}>
              <IconButton title='Duplicate object' iconSrc={DuplicateIcon} onClick={handleCopy} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Send to back' iconSrc={SendToBackIcon} onClick={() => handleSendToPosition('back')} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Bring to front' iconSrc={SendToFrontIcon} onClick={() => handleSendToPosition("front")} color='grey' showBorder={false} showText={false}/>
              <IconButton title='Remove object' iconSrc={DeleteIcon} onClick={removeObject} color='grey' showBorder={false} showText={false}/>
            </div>
          </div>

          <div className='canvas__container' ref={canvasContainerRef}>
            <canvas width={canvasWidth()} height={600} ref={canvasElRef} />
          </div>
          {textState.hidden ? null : (
            <div className='standard-inputs'>
              <label>Text: </label>
              <input type='text' value={textState.text} onChange={(e) => handleChangeText(e.target.value)} />
            </div>
          )}
        </div>

        <div className="floorplan__desk-list-container">
          <div className='floorplan__desk-list'>
            <h2>Assignment</h2>
            <AccordionGroup>
              <AccordionItem name={'Unassigned places (' + unassignedBookableObjects?.length + ')'} id="unassigned-places">
              {unassignedBookableObjects && unassignedBookableObjects?.length < 1 && <p>No unassigned places</p>}
              <ul data-testid='unassigned-list'>
                {area?.bookableObjects
                  .filter((desk) => isNullOrEmpty(desk.floorPlanObjectId))
                  .map((desk) => (
                    <li key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
                      <div className='floorplan__desk-list-card'>
                        <strong>{desk.name}</strong>
                        <IconButton 
                          title='Assign' 
                          ariaLabel={'Assign ' + desk.name + ' to selected object'}
                          color='navy' 
                          onClick={() => assignDesk(desk.id)} 
                          showBorder={false} 
                          showText={true} 
                          iconSrc={AssignIcon} 
                          disabled={!selectedObject || selectedObject.hasAssignedDesk || !isNullOrEmpty(desk.floorPlanObjectId)}/>
                      </div>
                    </li>
                  ))}
              </ul>
              </AccordionItem>
              <AccordionItem name={'Assigned places (' + assignedBookableObjects?.length + ')'} id="assigned-places">
              {assignedBookableObjects && assignedBookableObjects?.length < 1 && <p>No assigned places</p>}
              <ul data-testid='assigned-list'>
                {area?.bookableObjects
                  .filter((desk) => !isNullOrEmpty(desk.floorPlanObjectId))
                  .map((desk) => (
                    <li key={desk.id} onClick={() => handleSelectCanvasObject(desk.floorPlanObjectId)}>
                      <div className='floorplan__desk-list-card'>
                        <strong>{desk.name}</strong>
                        <IconButton 
                          title='Unassign'
                          ariaLabel={'Unassign ' + desk.name} 
                          color='navy' 
                          onClick={() => unassignDesk(desk.id)} 
                          showBorder={false} 
                          showText={true} 
                          iconSrc={AssignIcon}/>
                      </div>
                    </li>
                  ))}
              </ul>
              </AccordionItem>
              <AccordionItem name='Help'>
                <p>Assigning an object to a bookable object creates an association between that visual object on your drawing and the bookable object record.</p>
                <p>We've designed it this way so that any shape, image, or line you add to the drawing can be made 'bookable' by the booker clicking on it.</p>
                <p>To assign:</p>
                <ol>
                  <li>click on an object on the floorplan drawing</li>
                  <li>click the 'assign' button for an unassigned place</li>
                </ol>
                <p>To unassign:</p>
                <ol>
                  <li>simply click the 'unassign' button for an assigned place</li>
                </ol>
              </AccordionItem>
            </AccordionGroup>
          </div>
        </div>
      </div>
      <br/>
      <div>
        <CtaButton type='button' text='Save all changes' color='cta-green' onClick={saveLocation} />
      </div>
    </>
  );
};

export default FloorplanEditor;