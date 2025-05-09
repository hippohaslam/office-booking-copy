import "./NewBooking.scss";
import "react-datepicker/dist/react-datepicker.css";
import { Helmet } from "react-helmet";
import { fabric } from "fabric";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingsForDateAsync, getLocationAreaAsync, getLocationAsync, postBookingAsync } from "../../../services/Apis.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import * as sharedFabric from "../../../shared/fabric/Canvas.ts";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects.ts";
import { isNullOrEmpty } from "../../../helpers/StringHelpers.ts";
import { compareAlphabeticallyByPropertyWithNumbers } from "../../../helpers/ArrayHelpers.ts";
import { useWindowSize } from "../../../hooks/WindowSizeHook.tsx";
import CustomDatePicker from "../../../components/date-picker/DatePicker.tsx";
import { Breadcrumbs, ConfirmModal, ErrorBanner, TabItem, TabList, CtaLink } from "../../../components/index.ts";
import BookingCardStacked from "../../../components/booking/BookingCardStacked.tsx";
import { AxiosError } from "axios";
import { BookableObject } from "../../../interfaces/Desk";
import { DaysEnum } from "../../../enums/DaysEnum.ts";
import {
  getExistingBookingsFloorPlanIdAndBookedBy,
  getExistingBookingsFloorPlanIds,
  getNonExistingBookingsFloorPlanIds,
} from "../../../helpers/BookingHelpers.ts";
import * as localStorageApi from "../../../services/LocalStorage.ts";
import { BookableObjectTypeEnum } from "../../../enums/BookableObjectTypeEnum.ts";
import { PlusIcon, MinusIcon } from "../../../assets";
import CanvasToolTip from "../../../components/canvas/CanvasToolTip.tsx";
import { useFeatureFlags } from "../../../contexts/FeatureFlagsContext";
import {InformationBanner} from "../../../components";

// Seperate API endpoints just for the floorplan? then it can be cached for a long time on both server and client for optimal performance. If so change floorplan as well
// Desk data can be fetched from the booking API and we can switch days without reloading the floorplan.
// Needs discussion with the team to see what's the best approach.

const Constants = {
  activeBookingTab: "activeBookingTab",
  bookingDate: "bookingDate",
};

const loadActiveTab = () => {
  const savedTab = localStorage.getItem(Constants.activeBookingTab);
  return savedTab ? Number(savedTab) : 0;
};

const initialDate = () => {
  const sessionDate = sessionStorage.getItem(Constants.bookingDate);
  return sessionDate ? new Date(sessionDate) : new Date();
};

const NewBooking = () => {
  const navigate = useNavigate();
  const { locationId, areaId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate());
  const [selectedObject, setSelectedObject] = useState<BookableObject | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(loadActiveTab());
  const [showCanvas, setShowCanvas] = useState<boolean>(activeTab === 0);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth, windowHeight } = useWindowSize();
  const [error, setError] = useState<AxiosError | null>(null);
  const [isModalLoading, setModalLoading] = useState(false);
  const panningInfoRef = useRef<{ x: number; y: number } | null>(null);
  const [dateDisplay, setDateDisplay] = useState<string>("");
  const [tooltipEnabled, setTooltipEnabled] = useState<boolean>(localStorageApi.getAdditionalCanvasOptions().enableTooltip);
  const { waitingListFeature } = useFeatureFlags();

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
      sessionStorage.setItem(Constants.bookingDate, selectedDate.toISOString());
      setDateDisplay(
        DaysEnum[selectedDate.getDay()] +
          " " +
          selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      );
      refetch();
    }
  }, [refetch, selectedDate]);

  const handleSetObjectColours = () => {
    sharedFabric.resetObjectColoursToWhite(fabricCanvasRef.current);
    sharedFabric.setObjectsFillAndStrokeById(
      fabricCanvasRef.current,
      getExistingBookingsFloorPlanIds(areaData?.bookableObjects ?? [], bookingsData?.bookableObjects ?? []),
      "grey",
      "black",
    );
    sharedFabric.setObjectsFillAndStrokeById(
      fabricCanvasRef.current,
      getNonExistingBookingsFloorPlanIds(areaData?.bookableObjects ?? [], bookingsData?.bookableObjects ?? []),
      "green",
      "black",
    );
  };

  const adjustCanvasSize = useCallback(() => {
    if (fabricCanvasRef.current) {
      let height = 0;
      let width = 0;
      if (showCanvas) {
        if (windowWidth < 1513) {
          width = windowWidth - 60;
        } else {
          width = 1452;
        }

        height = windowHeight - 300;
      } else {
        width = 1;
        height = 1;
      }
      sharedFabric.AdjustCanvasSize(fabricCanvasRef.current, width, height);
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
        handleSetObjectColours();
      } else {
        const bookableObject = areaData?.bookableObjects.find((obj) => obj.floorPlanObjectId === floorplanObjectId);
        if (bookableObject) {
          sharedFabric.setObjectsFillAndStrokeById(fabricCanvasRef.current, [floorplanObjectId], "orange", "black");
          setSelectedObject(bookableObject);
          setModalVisible(true);
        }
      }
    },
    [areaData?.bookableObjects],
  );

  // For canvas options
  useEffect(() => {
    let options = localStorageApi.getAdditionalCanvasOptions();
    options.enableTooltip = tooltipEnabled;
    localStorageApi.setAdditionalCanvasOptions(options);
    setTooltipEnabled(tooltipEnabled);
  }, [tooltipEnabled]);

  // All the canvas logic and state rendering
  const initializeCanvas = useCallback(() => {
    if (canvasElRef.current) {
      const canvasOptions: sharedFabric.SharedCanvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600,
        selection: false,
        allowTouchScrolling: true,
      };
      const fabricCanvas = sharedFabric.loadCanvas(areaData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);
      adjustCanvasSize();

      // Make all objects non-selectable (but still emits events when clicked on)
      sharedFabric.setAllObjectsNonSelectable(fabricCanvas);

      // find fabric object with the id of the bookableObject
      if (areaData) {
        const withIds = areaData.bookableObjects
          .filter((bookableObject) => {
            return !isNullOrEmpty(bookableObject.floorPlanObjectId);
          })
          .map((bookableObject) => {
            return bookableObject.floorPlanObjectId!;
          });

        sharedFabric.setCurserToPointer(fabricCanvas, withIds);
      }

      if (bookingsData?.bookableObjects) {
        if (tooltipEnabled) {
          const existing = getExistingBookingsFloorPlanIdAndBookedBy(
            areaData?.bookableObjects ?? [],
            bookingsData?.bookableObjects ?? [],
          ).map((obj) => {
            return {
              id: obj.id,
              tooltip: `Booked by: ${obj.text}`,
            };
          });
          sharedFabric.addTooltipToObjects(fabricCanvas, "tooltip", existing);
        } else {
          sharedFabric.addTooltipToObjects(fabricCanvas, "tooltip", []);
        }
      }

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
          // Checking for touch screen events
          if (typeof TouchEvent !== "undefined" && e.e instanceof TouchEvent) {
            const touch = e.e.changedTouches[0];
            const canvasMoved = panningInfoRef.current.x !== touch.clientX || panningInfoRef.current.y !== touch.clientY;

            if (canvasMoved === false) {
              if (isCustomFabricObject(e.target as CustomFabricObject)) {
                handleObjectSelected((e.target as CustomFabricObject).id ?? null);
              } else {
                handleObjectSelected(null);
              }
            }
            panningInfoRef.current = null;
          } else {
            const canvasMoved = panningInfoRef.current.x !== e.e.clientX || panningInfoRef.current.y !== e.e.clientY;
            if (canvasMoved === false) {
              if (isCustomFabricObject(e.target as CustomFabricObject)) {
                handleObjectSelected((e.target as CustomFabricObject).id ?? null);
              } else {
                handleObjectSelected(null);
              }
            }
            panningInfoRef.current = null;
          }
        }
      });

      sharedFabric.initializeCanvasZoom(fabricCanvas);
      sharedFabric.initializeCanvasDragging(fabricCanvas);
      handleSetObjectColours();
    }

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [adjustCanvasSize, bookingsData, handleObjectSelected, areaData?.bookableObjects, areaData?.floorPlanJson, tooltipEnabled]);

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
    localStorage.setItem(Constants.activeBookingTab, String(newIndex));
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
    handleSetObjectColours();
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

  const handleZoomInBtn = () => {
    if (fabricCanvasRef.current) {
      sharedFabric.zoomIn(fabricCanvasRef.current);
    }
  };

  const handleZoomOutBtn = () => {
    if (fabricCanvasRef.current) {
      sharedFabric.zoomOut(fabricCanvasRef.current);
    }
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
            cancelButtonLabel='Back'
            cancelButtonColor='cta-violet'
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
      to: `/locations/${locationData?.id}/areas`,
      text: locationData?.name ?? "Location",
    },
    ...(locationData?.areas.length && locationData.areas.length > 1 ? [{ to: "", text: areaData?.name ?? "Pick a space" }] : []),
  ];

  const getStandardBookableObjectsStatus = (bookingsData: BookedObjects | null) => {
    // Filter for Standard bookable objects
    const standardObjects = areaData?.bookableObjects.filter((obj) => obj.bookableObjectTypeId === BookableObjectTypeEnum.Standard) || [];

    // Check if all Standard objects are booked
    const allBooked = standardObjects.every((standardObj) =>
      bookingsData?.bookableObjects.some((bookedObj) => bookedObj.id === standardObj.id && bookedObj.existingBooking !== null),
    );

    return { allBooked };
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

  // RENDERING STUFF
  return (
    <div>
      <Helmet>
        <title>{"Pick a space in " + areaData?.name + " at " + locationData?.name + " | Make a new booking | Hippo Reserve"}</title>
      </Helmet>
      <Breadcrumbs items={breadcrumbItems} />
      {error !== null ? (
        <ErrorBanner
          isShown={error !== null}
          allowClose={false}
          title='There was an error when placing your booking'
          errorMessage={error.response?.data as string}
        />
      ) : null}
      <div id='tooltip'></div>
      <h1>Pick a space</h1>
      <CustomDatePicker
        adjustDate={adjustDate}
        inputOnChange={(date) => setSelectedDate(date!)}
        selectedDate={selectedDate}
        minDate={new Date()}
        maxDate={new Date(new Date().setDate(new Date().getDate() + 42))}
      />
      <div className='display-with-actions'>
        <div className='date-display'>{dateDisplay}</div>
        <div>
          {waitingListFeature && getStandardBookableObjectsStatus(bookingsData!)?.allBooked ? (
              <InformationBanner
                  title="All spaces are booked"
                  isShown={true}
                  allowClose={false}
                  description="There are no bookable spaces available in this area on this date."
                  cta={
                    <CtaLink
                        text='Join waiting list'
                        to={`/locations/${locationId}/areas/${areaId}/waiting-list/join?date=${selectedDate.toISOString().split("T")[0]}`}
                        color='cta-navy'
                        withArrow={true}
                    ></CtaLink>
                  }
              />
          ) : null}
        </div>
      </div>

      <TabList activeTabIndex={activeTab} onChange={handleTabChange}>
        <TabItem label='Floorplan'>
          <div className='canvas__container'>
            <canvas height={800} width={600} ref={canvasElRef} />
            <div className='zoom-in-out-btns'>
              <button aria-label='zoom in' onClick={handleZoomInBtn}>
                <img src={PlusIcon} alt='Zoom in' />
              </button>
              <button aria-label='zoom out' onClick={handleZoomOutBtn}>
                <img src={MinusIcon} alt='Zoom out' />
              </button>
            </div>
          </div>
          <CanvasToolTip tooltipEnabled={tooltipEnabled} setTooltipEnabled={setTooltipEnabled} />
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

export default NewBooking;
