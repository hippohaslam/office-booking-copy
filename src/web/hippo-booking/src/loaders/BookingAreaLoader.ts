import { QueryClient } from "@tanstack/react-query";
import { getLocationAreasAsync, getLocationAsync } from "../services/Apis";

export type BookingAreaParams = {
  locationId: string;
};


// Used in the routing loader
export const bookingAreasLoader = (queryClient: QueryClient) => async (params: BookingAreaParams) => {
  const locationId = Number.parseInt(params.locationId);
  const areaData = await queryClient.fetchQuery({
    queryKey: ["booking-areas", locationId],
    queryFn: () => getLocationAreasAsync()(locationId),
  });
  const locationData = await queryClient.fetchQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAsync()(params.locationId),
  })
  return { areaData, locationData };
};