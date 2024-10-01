import "./Booking.scss";
import "react-datepicker/dist/react-datepicker.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingsForDateAsync, getLocationAreaAsync, getLocationAsync, postBookingAsync } from "../../../services/Apis";
import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { compareAlphabeticallyByPropertyWithNumbers } from "../../../helpers/ArrayHelpers";
import { useWindowSize } from "../../../hooks/WindowSizeHook";
import CustomDatePicker from "../../../components/date-picker/DatePicker";
import { Breadcrumbs, ConfirmModal, ErrorBanner, TabItem, TabList } from "../../../components";
import BookingCardStacked from "../../../components/booking/BookingCardStacked";
import { AxiosError } from "axios";
import { BookableObject } from "../../../interfaces/Desk";

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
  const [showCanvas, setShowCanvas] = useState<boolean>(activeTab === 0);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth, windowHeight } = useWindowSize();
  const navigate = useNavigate();
  const [error, setError] = useState<AxiosError | null>(null);
  const [isModalLoading, setModalLoading] = useState(false);
  const panningInfoRef = useRef<{ x: number; y: number } | null>(null);

  const { data: areaData } = useQuery({
    queryKey: ["area", areaId],
    queryFn: () => getLocationAreaAsync()(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  const { data: locationData } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAsync()(locationId as string),
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
      navigate(`/bookings/${data.id}/confirmed`);
      return data;
    },
    onError: (error) => {
      setModalLoading(false);
      handleCloseModal();
      setError(error as AxiosError);
    },
  });

  useEffect(() => {
    if (selectedDate) {
      refetch();
    }
  }, [refetch, selectedDate]);

  const handleObjectColours = useCallback(
    (objectId: string | null) => {
      const setColours = (object: CustomFabricObject) => {
        const getColorBasedOnBookingStatus = () => {
          // Find if the object is bookable
          const bookableObject = areaData?.bookableObjects.find((obj) => obj.floorPlanObjectId === object.id);
          const isBookable = bookingsData?.bookableObjects.find((obj) => obj.id === bookableObject?.id);

          // Determine the color based on booking status
          if (!isBookable) {
            return "white";
          } else if (isBookable.existingBooking) {
            return "grey"; // Booked
          } else {
            return "green"; // Not booked
          }
        };

        // log out the type
        // fill the colour of a group
        if (object.type === "group") {
          const group = object as fabric.Group;
          group.getObjects().forEach((obj) => {
            if (obj.type === "path" || obj.type === "rect") {
              obj.set({
                fill: getColorBasedOnBookingStatus(),
              });
            }
          });
        } else {
          object.set("fill", getColorBasedOnBookingStatus());
        }
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
    [bookingsData?.bookableObjects, areaData?.bookableObjects],
  );

  const adjustCanvasSize = useCallback(() => {
    if (fabricCanvasRef.current) {
      if (windowWidth < 1513 && showCanvas) {
        fabricCanvasRef.current.setWidth(windowWidth - 60);
      } else if (showCanvas) {
        fabricCanvasRef.current.setWidth(1452); //(Max width - margins)
      }

      fabricCanvasRef.current.setHeight(windowHeight - 300);

      if (showCanvas === false) {
        fabricCanvasRef.current.setWidth(1);
        fabricCanvasRef.current.setHeight(1);
      }
      fabricCanvasRef.current.renderAll();
    }
  }, [windowWidth, showCanvas]);

  const handleListItemSelected = useCallback((bookableObject: BookableObject) => {
    setSelectedObject(bookableObject);
    setModalVisible(true);
  }, []);

  const handleObjectSelected = useCallback(
    (floorplanObjectId: string | null) => {
      // This is more of a guard as it should not expect a null value coming from the canvas objects
      if (isNullOrEmpty(floorplanObjectId)) {
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
    [handleObjectColours, areaData?.bookableObjects],
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

          if (object.type === "text") {
            object.selectable = false;
            object.evented = false;
          }
          if (isCustomFabricObject(object)) {
            handleObjectColours(null);
          }
        }
      });
      fabricCanvas.renderAll();

      fabricCanvas.on("mouse:down", (e: fabric.IEvent<MouseEvent>) => {
        // So we can track if the user is panning the canvas
        if (typeof TouchEvent !== "undefined" && e.e instanceof TouchEvent) {
          const touch = e.e.touches[0];
          panningInfoRef.current = { x: touch.clientX, y: touch.clientY };
        } else {
          panningInfoRef.current = { x: e.e.clientX, y: e.e.clientY };
        }
      });

      fabricCanvas.on("mouse:up", (e: fabric.IEvent<MouseEvent>) => {
        if (panningInfoRef.current) {
          if (typeof TouchEvent !== "undefined" && e.e instanceof TouchEvent) {
            const touch = e.e.changedTouches[0];
            if (panningInfoRef.current.x !== touch.clientX || panningInfoRef.current.y !== touch.clientY) {
              panningInfoRef.current = null;
            } else {
              panningInfoRef.current = null;
              handleFinalTouch(e.target as CustomFabricObject);
            }
          } else {
            if (panningInfoRef.current.x !== e.e.clientX || panningInfoRef.current.y !== e.e.clientY) {
              panningInfoRef.current = null;
            } else {
              panningInfoRef.current = null;
              handleFinalTouch(e.target as CustomFabricObject);
            }
          }
        }
      });

      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas);
    }

    function handleFinalTouch(target: CustomFabricObject) {
      const selectedFabricObject = target as CustomFabricObject;
      if (selectedFabricObject) {
        // check if data contains an id matching the selected object

        if (!isNullOrEmpty(selectedFabricObject.id)) {
          const found = areaData?.bookableObjects.find((obj) => obj.floorPlanObjectId === selectedFabricObject.id);
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

  const handleTabChange = (newIndex: number) => {
    setActiveTab(newIndex);
    newIndex === 0 ? setShowCanvas(true) : setShowCanvas(false);
    localStorage.setItem("activeBookingTab", String(newIndex));
  };

  const handleConfirmBooking = () => {
    if (isModalLoading) {
      return;
    }
    if (selectedObject) {
      setModalLoading(true);
      handleBooking.mutate({
        date: selectedDate.toISOString().split("T")[0],
        bookableObjectId: selectedObject.id,
        areaId: Number.parseInt(areaId!),
      });
    }
  };

  const handleCloseModal = () => {
    if (isModalLoading) {
      return;
    }
    setModalVisible(false);
    setSelectedObject(null);
  };

  const getExistingBookingName = (bookableObject: BookableObject) => {
    return bookingsData?.bookableObjects.find((obj) => obj.id === bookableObject.id)?.existingBooking?.name ?? null;
  };

  // Returns the name of the person who booked the desk or null if it's available
  const getBookedBy = (selectedObject: BookableObject): string | null => {
    const bookedBy = bookingsData?.bookableObjects.find((obj) => obj.id === selectedObject.id)?.existingBooking?.name;
    return bookedBy ? `${bookedBy}` : null;
  };

  const adjustDate = (direction: "next" | "previous" | "today" | "tomorrow") => {
    setSelectedDate((prev) => {
      if (direction === "today") {
        return new Date();
      }
      const newDate = new Date(prev);
      if (direction === "previous") {
        newDate.setDate(newDate.getDate() - 1);
      } else {
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
                <h3>This space has already been booked on this date</h3>
                <p>Booked by: {getBookedBy(selectedObject)}</p>
                <br />
              </div>
            }
            showConfirmButton={false}
            cancelButtonLabel='Cancel'
            cancelButtonColor='cta-red'
            onCancel={handleCloseModal}
          />
        );
      } else {
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
            confirmButtonLabel={isModalLoading ? "Placing booking" : "Yes. Book it"}
            confirmButtonColor='cta-green'
            confirmButtonDisabled={isModalLoading}
            confirmButtonLoading={isModalLoading}
            onConfirm={handleConfirmBooking}
            cancelButtonLabel='No. Cancel'
            cancelButtonColor='cta-red'
            cancelButtonDisabled={isModalLoading}
            onCancel={handleCloseModal}
          />
        );
      }
    }
  };

  const breadcrumbItems = [
    { to: "/", text: "Home" },
    { to: "/locations", text: "Locations" },
    {
      to: "/locations/" + locationData?.id! + `/areas`,
      text: locationData?.name ?? "Location",
    },
  ];

  if (locationData) {
    if (locationData?.areas.length > 1) {
      breadcrumbItems.push({ text: areaData?.name ?? "Pick a space", to: "" });
    }
  }

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      {error !== null ? (
        <ErrorBanner
          isShown={error !== null}
          allowClose={false}
          title='There was an error when placing your booking'
          errorMessage={error.response?.data as string}
        />
      ) : null}

      <h1>Pick a space</h1>
      <CustomDatePicker
        adjustDate={adjustDate}
        inputOnChange={(date) => setSelectedDate(date!)}
        selectedDate={selectedDate}
        minDate={new Date()}
        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
      />
      <br />

      <TabList activeTabIndex={activeTab} onChange={handleTabChange}>
        <TabItem label='Floorplan'>
          <div className='canvas__container'>
            <canvas height={800} width={600} ref={canvasElRef} />
          </div>
          <div className='color-key__container'>
            <strong>Key:</strong>
            <div className='color-key'>
              <div className='color-block color-block__green'></div>
              <span>- available</span>
            </div>
            <div className='color-key'>
              <div className='color-block color-block__grey'></div>
              <span>- not available</span>
            </div>
            <div className='color-key'>
              <div className='color-block color-block__orange'></div>
              <span>- selected</span>
            </div>
            <div className='color-key'>
              <div className='color-block color-block__white'></div>
              <span>- not selectable</span>
            </div>
          </div>
        </TabItem>

        <TabItem label='List'>
          <ul className='bookable-objects-list'>
            {areaData?.bookableObjects
              .sort((a, b) => compareAlphabeticallyByPropertyWithNumbers(a, b, "name"))
              .map((bookableObject) => {
                return (
                  <li key={bookableObject.id + "-list-item"} className='bookable-Objects-list-item'>
                    <BookableObjectListDisplay
                      key={bookableObject.id}
                      bookableObject={bookableObject}
                      existingBookingName={getExistingBookingName(bookableObject)}
                      onObjectSelected={handleListItemSelected}
                    />
                  </li>
                );
              })}
          </ul>
        </TabItem>
      </TabList>
      {confirmBookingModal()}
      <br />
    </div>
  );
};

const BookableObjectListDisplay = ({
  bookableObject,
  existingBookingName,
  onObjectSelected,
}: {
  bookableObject: BookableObject;
  existingBookingName: string | null;
  onObjectSelected: (bookableObject: BookableObject) => void;
}) => {
  return (
    <button
      className={
        `bookable-object-button ` + (existingBookingName != null ? "bookable-object-button__booked" : "bookable-object-button__available")
      }
      key={bookableObject.id}
      onClick={() => onObjectSelected(bookableObject)}
    >
      {bookableObject.name} {" - " + (existingBookingName != null ? "Booked by " + existingBookingName : "Available")}
    </button>
  );
};

export default DeskBooking;
