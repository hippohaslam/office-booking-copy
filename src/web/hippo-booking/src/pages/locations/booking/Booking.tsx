import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingsForDateAsync, getLocationAreaAsync, getLocationAsync, postBookingAsync } from "../../../services/Apis";
import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { useWindowSize } from "../../../hooks/WindowSizeHook";
import "react-datepicker/dist/react-datepicker.css";
import './Booking.scss';
import CustomDatePicker from "../../../components/date-picker/DatePicker";
import { ConfirmModal, ErrorBanner, TabItem, TabList } from "../../../components";
import BookingCardStacked from "../../../components/booking/BookingCardStacked";
import { AxiosError } from "axios";

// Seperate API endpoints just for the floorplan? then it can be cached for a long time on both server and client for optimal performance. If so change floorplan as well
// Desk data can be fetched from the booking API and we can switch days without reloading the floorplan.
// Needs discussion with the team to see what's the best approach.

const loadActiveTab = () => {
  const savedTab = localStorage.getItem("activeBookingTab");
  if (savedTab) {
    return Number(savedTab);
  }
};

const DeskBooking = () => {
  const { locationId, areaId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedObject, setSelectedObject] = useState<BookableObject | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(loadActiveTab() ?? 0);
  const [showCanvas, setShowCanvas] = useState<boolean>(activeTab === 0)
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth, windowHeight } = useWindowSize();
  const navigate = useNavigate();
  const [error, setError] = useState<AxiosError | null>(null);

  const { data: areaData } = useQuery({
    queryKey: ["area", areaId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  const { data: locationData } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAsync(locationId as string),
    enabled: !!locationId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  const { data: bookingsData, refetch } = useQuery({
    queryKey: ["bookings", locationId, areaId],
    queryFn: () => getBookingsForDateAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), selectedDate),
    enabled: !!locationId && !!areaId,
  });

  const handleBooking = useMutation({
    mutationFn: (booking: NewBooking) => postBookingAsync(booking),
    onSuccess: (data) => {
      refetch();
      return data;
    }
  });

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
          const bookableObject = areaData?.bookableObjects.find(
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
    [bookingsData?.bookableObjects, areaData?.bookableObjects]
  );

  const adjustCanvasSize = useCallback(() => {
    if (fabricCanvasRef.current) {
      if (windowWidth < 1513 && showCanvas) {
        fabricCanvasRef.current.setWidth(windowWidth - 60);
        
      } else if (showCanvas) {
        fabricCanvasRef.current.setWidth(1452); //(Max width - margins)
      }

      fabricCanvasRef.current.setHeight(windowHeight - 150);

      if (showCanvas === false) {
        fabricCanvasRef.current.setWidth(1);
        fabricCanvasRef.current.setHeight(1);
      }
      fabricCanvasRef.current.renderAll();
    }
  }
  , [windowWidth, showCanvas]);

  const handleObjectSelected = useCallback(
    (floorplanObjectId: string | null) => {
      if (floorplanObjectId === null) {
        setSelectedObject(null);
        handleObjectColours(null);
        return;
      }
      const bookableObject = areaData?.bookableObjects.find((obj) => obj.floorPlanObjectId === floorplanObjectId);
      if (bookableObject) {
        setSelectedObject(bookableObject);
        setModalVisible(true);
      }
    },
    [handleObjectColours, areaData?.bookableObjects]
  );

  // All the canvas logic and state rendering
  const initializeCanvas = useCallback(() => {
    if (canvasElRef.current) {
      const canvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600,
      };
      const fabricCanvas = loadCanvas(areaData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);
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
          if (areaData?.bookableObjects.find((obj) => obj.floorPlanObjectId === object.id)) {
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
            const found = areaData?.bookableObjects.find(
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
  }, [adjustCanvasSize, bookingsData, handleObjectColours, handleObjectSelected, areaData?.bookableObjects, areaData?.floorPlanJson]);

  useEffect(() => {
    if (activeTab === 0) {
      initializeCanvas();
      setShowCanvas;
    }

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [activeTab, initializeCanvas]);

  const handleTabChange = (newIndex : number) => {
    setActiveTab(newIndex);
    newIndex === 0 ? setShowCanvas(true) : setShowCanvas(false);
    localStorage.setItem("activeBookingTab", String(newIndex))
  }

  const handleConfirmBooking = () => {
    if (selectedObject) {
      handleBooking.mutate({
        date: selectedDate.toISOString().split('T')[0],
        bookableObjectId: selectedObject.id,
        areaId: Number.parseInt(areaId!),
      },
      {
        onSuccess: (bookingData) => {
          navigate(`/bookings/${bookingData.id}/confirmed`);
        },
        onError: (error) => {
          handleCloseModal();
          console.log(error);
            setError(error as AxiosError);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedObject(null);
  };

  const getExistingBookingName = (bookableObject: BookableObject) => {
    return bookingsData?.bookableObjects.find((obj) => obj.id === bookableObject.id)?.existingBooking?.name ?? null;
  }

  // Returns the name of the person who booked the desk or null if it's available
  const getBookedBy = (selectedObject: BookableObject): string | null => {
    const bookedBy = bookingsData?.bookableObjects.find((obj) => obj.id === selectedObject.id)?.existingBooking?.name;
    return bookedBy ? `${bookedBy}` : null;
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

  const confirmBookingModal = () => {
    if (selectedObject) {
      if (getBookedBy(selectedObject)) {
        return (
          <ConfirmModal
          title={selectedObject.name}
          isOpen={isModalVisible} 
          childElement={
            <div>
              <p>{selectedObject.description}</p>
              <br />
              <strong>Sorry. This space has already been booked on this date by {getBookedBy(selectedObject)}.</strong>
            </div>}
          showConfirmButton={false}
          cancelButtonLabel="Cancel"
          cancelButtonColor="cta-red"
          onCancel={handleCloseModal}/>
        )
      }
      else {
        return (
          <ConfirmModal
          title={selectedObject.name}
          isOpen={isModalVisible} 
          childElement={
            <div>
              <p>{selectedObject.description}</p>
              <h3>Would you like to place this booking?</h3>
              <BookingCardStacked 
              date={selectedDate} 
              bookableObjectName={selectedObject.name} 
              areaName={areaData?.name ?? "Area not found"} 
              locationName={locationData?.name ?? "Location not found"}
              />
            </div>
          }
          showConfirmButton
          confirmButtonLabel="Yes. Book it"
          confirmButtonColor="cta-green"
          onConfirm={handleConfirmBooking}
          cancelButtonLabel="No. Cancel"
          cancelButtonColor="cta-red"
          onCancel={handleCloseModal}/>
        )
      }
    }
  } 

  return (
    <div>
      {error !== null ? (
        <ErrorBanner isShown={error !== null} allowClose={false} title="There was an error when placing your booking" errorMessage={error.response?.data as string}/>
      ) : null}
      
      <h1>Pick a space</h1>
      <CustomDatePicker adjustDate={adjustDate} inputOnChange={(date) => setSelectedDate(date!)} selectedDate={selectedDate}/>
      <br />

      <TabList activeTabIndex={activeTab} onChange={handleTabChange}>
        <TabItem label="Floorplan">
          <div className="canvas__container">
            <canvas height={800} width={600} ref={canvasElRef} />
          </div>
        </TabItem>

        <TabItem label="List">
        <div>
          {areaData?.bookableObjects
            .filter((obj) => !isNullOrEmpty(obj.floorPlanObjectId))
            .map((bookableObject) => {
              return (
                <BookableObjectDisplay
                  key={bookableObject.id}
                  bookableObject={bookableObject}
                  existingBookingName={getExistingBookingName(bookableObject)}
                  onObjectSelected={handleObjectSelected}
                />
              );
            })}
        </div>
        </TabItem>
      </TabList>
      {confirmBookingModal()}
      <br />
      
    </div>
  );
};

const BookableObjectDisplay = ({
  bookableObject,
  existingBookingName,
  onObjectSelected,
}: {
  bookableObject: BookableObject;
  existingBookingName: string | null;
  onObjectSelected: (floorPlanObjectId: string) => void;
}) => {
  return (
    <div
      className={`booking-list-item ` + (existingBookingName != null  ? "booking-list-item__booked" : "booking-list-item__available")}
      key={bookableObject.id}
      onClick={() => onObjectSelected(bookableObject.floorPlanObjectId!)}
    >
      {bookableObject.name} {" - " + (existingBookingName != null ? "Booked by " + existingBookingName : "Available")}
    </div>
  );
};

export default DeskBooking;
