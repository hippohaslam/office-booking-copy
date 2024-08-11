import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBookingsForDateAsync, getLocationAreaAsync, postBookingForDateAsync } from "../../../services/Apis";
import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { useWindowSize } from "../../../hooks/WindowSizeHook";
import { CtaButton } from "../../../components/buttons/Buttons";

import "react-datepicker/dist/react-datepicker.css";
import './Booking.scss';
import CustomDatePicker from "../../../components/date-picker/DatePicker";

// Seperate API endpoints just for the floorplan? then it can be cached for a long time on both server and client for optimal performance. If so change floorplan as well
// Desk data can be fetched from the booking API and we can switch days without reloading the floorplan.
// Needs discussion with the team to see what's the best approach.

interface CanvasPreferences {
  showCanvas: boolean;
}

const canvasPreferenceKey = "canvasPreferences";

const saveCanvasPreferences = (options: CanvasPreferences) => {
  localStorage.setItem(canvasPreferenceKey, JSON.stringify(options));
};

const loadCanvasPreferences = () => {
  const canvasPreferences = localStorage.getItem(canvasPreferenceKey);
  if (canvasPreferences) {
    const options: CanvasPreferences = JSON.parse(canvasPreferences);
    return options;
  }
};

const DeskBooking = () => {
  const { locationId, areaId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedObject, setSelectedObject] = useState<BookableObject | null>(null);
  const selectedObjectRef = useRef<HTMLDivElement>(null);
  const [showCanvas, setShowCanvas] = useState<boolean>(loadCanvasPreferences()?.showCanvas ?? true);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth } = useWindowSize();

  const { data: locationData } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  const { data: bookingsData, refetch } = useQuery({
    queryKey: ["bookings", locationId, areaId],
    queryFn: () => getBookingsForDateAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), selectedDate),
    enabled: !!locationId && !!areaId,
  });

  const handleBooking = useMutation({
    mutationFn: (objectId: number) => postBookingForDateAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), selectedDate, objectId),
    onSuccess: () => refetch()
  })

  useEffect(() => {
    if(selectedDate){
      refetch();
    }
    
  }, [refetch, selectedDate]);

  const handleObjectColours = useCallback(
    (objectId: string | null) => {
      const setColours = (object: CustomFabricObject) => {

        const getColorBasedOnBookingStatus = () => {
          // Find if the object is bookable
          const bookableObject = locationData?.bookableObjects.find(
            (obj) => obj.floorPlanObjectId === object.id
          );
          const isBookable = bookingsData?.bookableObjects.find(
            (obj) => obj.id === bookableObject?.id
          );
        
          // Determine the color based on booking status
          if (!isBookable) {
            return 'white'; // Not a bookable object
          } else if (isBookable.existingBooking) {
            return 'grey'; // Booked
          } else {
            return 'green'; // Not booked
          }
        };

        object.set("fill", getColorBasedOnBookingStatus());
      };

      if (objectId !== null) {
        fabricCanvasRef.current?.forEachObject((object: CustomFabricObject) => {
          if (isCustomFabricObject(object) && object.id !== objectId) {
            setColours(object);
          }
        });
        fabricCanvasRef.current?.renderAll();
      } else {
        fabricCanvasRef.current?.forEachObject((object: CustomFabricObject) => {
          if (isCustomFabricObject(object)) {
            setColours(object);
          }
        });
        fabricCanvasRef.current?.renderAll();
      }
    },
    [bookingsData?.bookableObjects, locationData?.bookableObjects]
  );

  const adjustCanvasSize = useCallback(() => {
    if (fabricCanvasRef.current) {
      if (windowWidth < 900 && showCanvas) {
        fabricCanvasRef.current.setWidth(windowWidth - 70);
        
      } else if (showCanvas) {
        fabricCanvasRef.current.setWidth(800);
      }

      if(windowWidth < 600){
        fabricCanvasRef.current.setHeight(250);
      } else {
        fabricCanvasRef.current.setHeight(600);
      }

      if (showCanvas === false) {
        fabricCanvasRef.current.setWidth(1);
        fabricCanvasRef.current.setHeight(1);
      }
      saveCanvasPreferences({ showCanvas });
      fabricCanvasRef.current.renderAll();
    }
  }
  , [windowWidth, showCanvas]);

  // TODO: Get bookableobject data so we know if a desk is booked or not

  const handleObjectSelected = useCallback(
    (floorplanObjectId: string | null) => {
      if (floorplanObjectId === null) {
        setSelectedObject(null);
        handleObjectColours(null);
        return;
      }
      const bookableObject = locationData?.bookableObjects.find((obj) => obj.floorPlanObjectId === floorplanObjectId);
      if (bookableObject) {
        setSelectedObject(bookableObject);
      }
    },
    [handleObjectColours, locationData?.bookableObjects]
  );

  // Scroll to selected object
  useEffect(() => {
    if (selectedObject !== null && selectedObjectRef.current !== null) {
      selectedObjectRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedObject]);

  // All the canvas logic and state rendering
  useEffect(() => {
    if (canvasElRef.current) {
      const canvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600,
      };
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);
      fabricCanvas.allowTouchScrolling = true;
      adjustCanvasSize();
      fabricCanvas.selection = false;

      // Make all objects non-selectable (but still emits events when clicked on)
      fabricCanvas.forEachObject((object: CustomFabricObject) => {
        if (object) {
          object.selectable = false;
          object.lockMovementX = true;
          object.lockMovementY = true;
          object.hasControls = false;
          object.hasBorders = false;
          if (locationData?.bookableObjects.find((obj) => obj.floorPlanObjectId === object.id)) {
            object.hoverCursor = "pointer";
          } else {
            object.hoverCursor = "default";
          }

          if (isCustomFabricObject(object)) {
            if(object.type === "text"){
              object.selectable = false;
              object.evented = false;
            }
            handleObjectColours(null);
          }
        }
      });
      fabricCanvas.renderAll();

      fabricCanvas.on("mouse:down", (e: fabric.IEvent<Event>) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
          // check if data contains an id matching the selected object

          if (!isNullOrEmpty(selectedFabricObject.id)) {
            const found = locationData?.bookableObjects.find(
              (obj) => obj.floorPlanObjectId === selectedFabricObject.id
            );
            if (found !== undefined) {
              handleObjectSelected(selectedFabricObject.id);
              if (isCustomFabricObject(selectedFabricObject)) {
                selectedFabricObject.set("fill", "orange");
                handleObjectColours(selectedFabricObject.id);
              }
            } else {
              setSelectedObject(null);
              handleObjectColours(null);
            }
          }
        } else {
          setSelectedObject(null);
          handleObjectColours(null);
        }
      });

      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas);
      
    }

    

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [adjustCanvasSize, bookingsData, handleObjectColours, handleObjectSelected, locationData?.bookableObjects, locationData?.floorPlanJson]);

  const handleToggleCanvas = () => {
    if (fabricCanvasRef.current) {
      setShowCanvas(!showCanvas);
    }
  };

  const handleConfirmBooking = (bookableObjectId: number) => {
    const confirmBooking = window.confirm("Book desk?");
    if (confirmBooking) {
      handleBooking.mutate(bookableObjectId);
      // TODO: Book desk, if successful go to the next page (still need to implement this)
      // If it fails show an error message
    }
  };

  const hasBooking = (bookableObject: BookableObject) => {
    const isBookable = bookingsData?.bookableObjects.find((obj) => obj.id === bookableObject.id);
    const isBooked = isBookable?.existingBooking;
    return isBooked !== undefined && isBooked !== null;
  };

  // Returns the name of the person who booked the desk or null if it's available
  const getBookedBy = (selectedObject: BookableObject): string | null => {
    const bookedBy = bookingsData?.bookableObjects.find((obj) => obj.id === selectedObject.id)?.existingBooking?.name;
    return bookedBy ? `Booked by: ${bookedBy}` : null;
  };

  const adjustDate = (direction: 'next' | 'previous' | 'today' | 'tomorrow') => {
    setSelectedDate(prev => {
      if(direction === 'today') {
        return new Date();
      }
      const newDate = new Date(prev);
      if(direction === 'previous') {
        newDate.setDate(newDate.getDate() - 1);
      }
      else {
        newDate.setDate(newDate.getDate() + 1);
      }
      
      return newDate;
    });
  };

  return (
    <div>
      <h1>Choose a space</h1>
      <CustomDatePicker adjustDate={adjustDate} inputOnChange={(date) => setSelectedDate(date!)} selectedDate={selectedDate}/>
      <div>

      </div>
        <br />
      <button type="button" onClick={handleToggleCanvas}>
        {showCanvas ? "Hide floorplan" : "Show floorplan"}
      </button>
      <div className="canvas__container">
        <canvas height={800} width={600} ref={canvasElRef} />
      </div>
      <br />
      <div ref={selectedObjectRef}></div>
      {selectedObject !== null ? (
        <div className="selected-object-element">
          <h3>{selectedObject.name}</h3>
          <p>{selectedObject.description}</p>
          <p>{getBookedBy(selectedObject) ?? "This is availabe for booking"}</p>
          {getBookedBy(selectedObject) ? null : (
            <div>
              <CtaButton text="Book this desk" onClick={() => handleConfirmBooking(selectedObject.id)} color={"cta-green"} />
              <button onClick={() => handleObjectSelected(null)}>Deselect</button>
            </div>
          )}
        </div>
      ) : null}
      <div>
        {locationData?.bookableObjects
          .filter((obj) => !isNullOrEmpty(obj.floorPlanObjectId))
          .map((bookableObject) => {
            const isBooked = hasBooking(bookableObject);
            return (
              <BookableObjectDisplay
                key={bookableObject.id}
                bookableObject={bookableObject}
                isBooked={isBooked}
                onObjectSelected={handleObjectSelected}
              />
            );
          })}
      </div>
    </div>
  );
};

const BookableObjectDisplay = ({
  bookableObject,
  isBooked,
  onObjectSelected,
}: {
  bookableObject: BookableObject;
  isBooked: boolean;
  onObjectSelected: (floorPlanObjectId: string) => void;
}) => {
  return (
    <div
      className={`booking-list-item ` + (isBooked ? "booking-list-item__booked" : "booking-list-item__available")}
      key={bookableObject.id}
      onClick={() => onObjectSelected(bookableObject.floorPlanObjectId!)}
    >
      {bookableObject.name} {" - " + (isBooked ? "Unavailable" : "Available")}
    </div>
  );
};

export default DeskBooking;
