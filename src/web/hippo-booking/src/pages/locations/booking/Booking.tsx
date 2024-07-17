import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getLocationAreaAsync } from "../../../services/Apis";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { initializeCanvasZoom, initializeCanvasDragging, loadCanvas } from "../../../shared/fabric/Canvas";
import { CustomFabricObject, isCustomFabricObject } from "../../../shared/fabric/CustomObjects";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import { CustomConfirmDialog } from "../../../components";

// Seperate API endpoints just for the floorplan? then it can be cached for a long time on both server and client for optimal performance. If so change floorplan as well
// Desk data can be fetched from the booking API and we can switch days without reloading the floorplan.
// Needs discussion with the team to see what's the best approach.



const DeskBooking = () => {
  const { locationId, areaId } = useParams();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(''); 


  const { data: locationData} = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationAreaAsync(locationId as string, areaId as string),
    enabled: !!locationId && !!areaId,
    //staleTime: 1000 * 60 * 60 * 12, // 12 hours.  TODO: Set for production use, extend time to a day? Makes sense to cache this data for a while.
  });

  // TODO: Get bookableobject data so we know if a desk is booked or not

  useEffect(() => {
    if (canvasElRef.current) {
      const fabricCanvas = loadCanvas(locationData?.floorPlanJson ?? "", canvasElRef, fabricCanvasRef);

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
              setDialogMessage('Would you like to book this desk?'); // Customize this message as needed
              setDialogOpen(true);
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



  return (
    <div>
      <h1>Desk Booking</h1>
          <CustomConfirmDialog
              isOpen={isDialogOpen}
              onConfirm={() => setDialogOpen(false)}
              onCancel={() => setDialogOpen(false)}
              message={dialogMessage}
          />
          <div className="canvas__container">
            <canvas width="800" height="600" ref={canvasElRef}/>
          </div>
    </div>
  );
}

export default DeskBooking;