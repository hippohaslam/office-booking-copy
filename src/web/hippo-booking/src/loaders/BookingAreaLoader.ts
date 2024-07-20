import { QueryClient } from "@tanstack/react-query";
import { getLocationAreasAsync } from "../services/Apis";

export type BookingAreaParams = {
  locationId: string;
};


// Used in the routing loader
export const bookingAreasLoader = (queryClient: QueryClient) => async (params: BookingAreaParams) => {
  const locationId = Number.parseInt(params.locationId);
  const data = await queryClient.fetchQuery({
    queryKey: ["booking-areas", locationId],
    queryFn: () => getLocationAreasAsync(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  return data;
};