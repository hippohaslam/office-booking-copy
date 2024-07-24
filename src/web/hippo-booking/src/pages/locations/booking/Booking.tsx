import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBookingsForDateAsync, getLocationAreaAsync } from "../../../services/Apis";
import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { useWindowSize } from "../../../hooks/WindowSizeHook";
import { CtaButton } from "../../../components/buttons/Buttons";

// Seperate API endpoints just for the floorplan? then it can be cached for a long time on both server and client for optimal performance. If so change floorplan as well
// Desk data can be fetched from the booking API and we can switch days without reloading the floorplan.
// Needs discussion with the team to see what's the best approach.

interface CanvasPreferences {
  showCanvas: boolean;
}

const saveCanvasPreferences = (options: CanvasPreferences) => {
  localStorage.setItem("canvasPreferences", JSON.stringify(options));
}

const loadCanvasPreferences = () => {
  const canvasPreferences = localStorage.getItem("canvasPreferences");
  if(canvasPreferences){
    const options: CanvasPreferences = JSON.parse(canvasPreferences);
    return options;
  }
}


const DeskBooking = () => {
  const { locationId, areaId } = useParams();
  const [selectedObject, setSelectedObject] = useState<BookableObject | null>(null);
  const selectedObjectRef = useRef<HTMLDivElement>(null);
  const [showCanvas, setShowCanvas] = useState<boolean>(false);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { windowWidth } = useWindowSize();


  const { data: locationData} = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  const {data: bookingsData} = useQuery({
    queryKey: ['bookings', locationId, areaId],
    queryFn: () => getBookingsForDateAsync(Number.parseInt(locationId!), Number.parseInt(areaId!), new Date()),
    enabled: !!locationId && !!areaId,
  })

  const handleAllObjectColourReset = useCallback((objectId: string | null) => {
    const setColours = (object: CustomFabricObject) => {
      let foundLocationObjectFloorplanId: string = '';
            const findBookableObject = (id: number) => {
              const found = locationData?.bookableObjects.find(obj => obj.id === id);
              if(found){
                foundLocationObjectFloorplanId = found.floorPlanObjectId as string;
              }
              return found !== undefined;
            };
            const isBooked = bookingsData?.bookableObjects.find(obj => findBookableObject(obj.id));
            if(isBooked !== undefined && foundLocationObjectFloorplanId !== '' && foundLocationObjectFloorplanId === object.id){
              object.set("fill", "grey");
            } else {
              object.set("fill", "white");
            }
    }

    if(objectId !== null){
      fabricCanvasRef.current?.forEachObject((object: CustomFabricObject) => {
        if(isCustomFabricObject(object) && object.id !== objectId){
          setColours(object)
        }
      });
      fabricCanvasRef.current?.renderAll();
    } else {
      fabricCanvasRef.current?.forEachObject((object: CustomFabricObject) => {
        if(isCustomFabricObject(object)){
          setColours(object)
        }
      });
      fabricCanvasRef.current?.renderAll();
    }
    // TODO: Reset colour depending on whether it's booked or not
  }, [bookingsData?.bookableObjects, locationData?.bookableObjects]);

  useEffect(() => {
    const canvasPreferences = loadCanvasPreferences();
    if(canvasPreferences){
      setShowCanvas(canvasPreferences.showCanvas);
      // focus on the selected object ref
    }
  }, []);

  useEffect(() => {
    if(selectedObject !== null && selectedObjectRef.current !== null){
      selectedObjectRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [selectedObject]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      // < 900 and your on mobile/tablet so adjust canvas size
      if(windowWidth < 900 && showCanvas){
        fabricCanvasRef.current.setWidth(windowWidth - 100);
        fabricCanvasRef.current.setHeight(600);
      } else if(showCanvas) {
        fabricCanvasRef.current.setWidth(800);
        fabricCanvasRef.current.setHeight(600);
      }
      
      
      if(showCanvas === false){
        fabricCanvasRef.current.setWidth(1);
        fabricCanvasRef.current.setHeight(1);
      }
      saveCanvasPreferences({showCanvas});
      fabricCanvasRef.current.renderAll();
    }
  }, [windowWidth, showCanvas]);

  // TODO: Get bookableobject data so we know if a desk is booked or not

  const handleObjectSelected = useCallback((id: string | null) => {
    if(id === null){
      setSelectedObject(null);
      handleAllObjectColourReset(null);
      return;
    }
    const bookableObject = locationData?.bookableObjects.find(obj => obj.floorPlanObjectId === id);
    if(bookableObject){
      setSelectedObject(bookableObject);
    }
  }, [handleAllObjectColourReset, locationData?.bookableObjects]);
  

  useEffect(() => {
    if (canvasElRef.current) {
      const canvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600
      };
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);

      // Make all objects non-selectable (but still emits events when clicked on)
      fabricCanvas.forEachObject((object: CustomFabricObject) => {
        if (object) {
          object.selectable = false; 
          object.lockMovementX = true; 
          object.lockMovementY = true; 
          object.hasControls = false;
          object.hasBorders = false; 
          if(locationData?.bookableObjects.find(obj => obj.floorPlanObjectId === object.id)){
            object.hoverCursor = "pointer";
          } else {
            object.hoverCursor = "default";
          }

          // Once we have knowledge of whether a desk is booked or not, we can change the color here (green/white for booked/unbooked desks)
          if(isCustomFabricObject(object)){
            // bookableObjectData, find the object in data and check if it's booked
            handleAllObjectColourReset(null);
          }
          
        }
      });
      fabricCanvas.renderAll();


      fabricCanvas.on("mouse:down", (e) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
            // check if data contains an id matching the selected object
            
            if(!isNullOrEmpty(selectedFabricObject.id)) {
              const found = locationData?.bookableObjects.find(obj => obj.floorPlanObjectId === selectedFabricObject.id);
              if(found !== undefined){
                handleObjectSelected(selectedFabricObject.id as string);
                if(isCustomFabricObject(selectedFabricObject)){
                  selectedFabricObject.set("fill", "orange");
                  handleAllObjectColourReset(selectedFabricObject.id as string);
                }
              } else {
                setSelectedObject(null);
                handleAllObjectColourReset(null);
              }
            }
        } else {
          setSelectedObject(null);
          handleAllObjectColourReset(null);
        }
      });


      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas);
    }

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    }
    
  }, [bookingsData, handleAllObjectColourReset, handleObjectSelected, locationData?.bookableObjects, locationData?.floorPlanJson]);
  

  const handleToggleCanvas = () => {
    if(fabricCanvasRef.current){
      setShowCanvas(!showCanvas);
    }
  }

  const handleConfirmBooking = () => {
    const confirmBooking = window.confirm("Book desk?");
    if(confirmBooking){
      console.log("Desk booked");
    }
  }

  return (
    <div>
      <h1>Desk Booking</h1>
          <button type="button" onClick={handleToggleCanvas}>{showCanvas ? "Hide floorplan" : "Show floorplan"}</button>
          <div className="canvas__container">
            <canvas height={1} width={1} ref={canvasElRef}/>
          </div>
          <br />
          <div ref={selectedObjectRef}></div>
          {selectedObject !== null ? 
            <div style={{margin: '20px 0', padding: '5px 15px 20px 15px', backgroundColor: '#f9a502', borderRadius: '10px'}}>
              <h3>{selectedObject.name}</h3>
              <p>{selectedObject.description}</p>
              <CtaButton text="Book this desk" onClick={handleConfirmBooking} color={"cta-green"} />
                <button onClick={() => handleObjectSelected(null)}>Deselect</button>
            </div> 
            : null}
          <div>
            {locationData?.bookableObjects.filter(obj => !isNullOrEmpty(obj.floorPlanObjectId)).map((bookableObject) => (
              <div key={bookableObject.id} onClick={() => handleObjectSelected(bookableObject.floorPlanObjectId as string)}>
                {bookableObject.name}
                </div>
            ))}
          </div>
    </div>
  );
}

export default DeskBooking;