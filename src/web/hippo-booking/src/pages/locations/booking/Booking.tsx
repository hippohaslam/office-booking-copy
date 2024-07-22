import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getLocationAreaAsync } from "../../../services/Apis";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { CustomConfirmDialog } from "../../../components";
import { useWindowSize } from "../../../hooks/WindowSizeHook";

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
  const [showCanvas, setShowCanvas] = useState<boolean>(false);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(''); 
  const { windowWidth } = useWindowSize();


  const { data: locationData} = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  useEffect(() => {
    const canvasPreferences = loadCanvasPreferences();
    if(canvasPreferences){
      setShowCanvas(canvasPreferences.showCanvas);
    }
  }, []);

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

  useEffect(() => {
    if (canvasElRef.current) {
      const canvasOptions = {
        backgroundColor: "white",
        width: 800,
        height: 600
      };
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef, canvasOptions);

      // Make all objects non-selectable (but still emits events when clicked on)
      fabricCanvas.forEachObject((object) => {
        if (object) {
          object.selectable = false; 
          object.lockMovementX = true; 
          object.lockMovementY = true; 
          object.hasControls = false;
          object.hasBorders = false; 
          object.hoverCursor = "pointer";

          // Once we have knowledge of whether a desk is booked or not, we can change the color here (green/white for booked/unbooked desks)
          if(isCustomFabricObject(object)){
            object.set("fill", "white");
          }
          
        }
      });
      fabricCanvas.renderAll();


      fabricCanvas.on("mouse:down", (e) => {
        const selectedFabricObject = e.target as CustomFabricObject;
        if (selectedFabricObject) {
            if(!isNullOrEmpty(selectedFabricObject.id)) {
              // TODO: Handle booking
              handleObjectSelected();
            }
        }
      });


      initializeCanvasZoom(fabricCanvas);
      initializeCanvasDragging(fabricCanvas);
    }

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    }
    
  }, [locationData?.floorPlanJson]);

  // TODO: Handle booking
  function handleObjectSelected() {
    setDialogMessage('Would you like to book this desk?'); // Customize this message as needed
    setDialogOpen(true);
  }
  

  const handleToggleCanvas = () => {
    if(fabricCanvasRef.current){
      setShowCanvas(!showCanvas);
    }
  }

  return (
    <div>
      <h1>Desk Booking</h1>
          <CustomConfirmDialog
              isOpen={isDialogOpen}
              onConfirm={() => setDialogOpen(false)}
              onCancel={() => setDialogOpen(false)}
              message={dialogMessage}
          />
          <button type="button" onClick={handleToggleCanvas}>{showCanvas ? "Hide floorplan" : "Show floorplan"}</button>
          <div className="canvas__container">
            <canvas height={1} width={1} ref={canvasElRef}/>
          </div>
          <br />
          <div>
            {locationData?.bookableObjects.map((bookableObject) => (
              <div key={bookableObject.id} onClick={handleObjectSelected}>
                {bookableObject.name}
                </div>
            ))}
          </div>
    </div>
  );
}

export default DeskBooking;