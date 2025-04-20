import { Navigate, useLoaderData, useParams } from "react-router-dom";
import { BookingLocation } from "../../interfaces/Location";
import BookingAreas from "./BookingAreas";

const AreaRedirect = () => {
  const { locationId } = useParams();
  const { areaData } = useLoaderData() as { 
    areaData: { id: number }[]; 
    locationData: BookingLocation 
  };

  if (areaData.length === 1) {
    return <Navigate to={`/locations/${locationId}/areas/${areaData[0].id}`} replace />;
  }

  return <BookingAreas />;
};

export default AreaRedirect; 