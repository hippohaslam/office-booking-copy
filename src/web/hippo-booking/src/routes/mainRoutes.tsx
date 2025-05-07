import { Suspense } from "react";
import { Booking, Locations } from "../imports";
import { BookingAreaParams, bookingAreasLoader } from "../loaders/BookingAreaLoader";
import ErrorPage from "../pages/error/Error";
import { ProtectedRoute } from "../ProtectedRoute";
import { Params } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import MyBookings from "../pages/bookings/my-bookings/MyBookings";
import BookingConfirmed from "../pages/bookings/booking-confirmed/BookingConfirmed";
import LocationDetails from "../pages/locations/locationDetails/LocationDetails";
import BookingDetails from "../pages/bookings/booking-details/BookingDetails";
import WaitingListJoin from "../pages/waiting-list/WaitingListJoin";
import WaitingListConfirmed from "../pages/waiting-list/WaitingListConfirmed";
import WaitingListBookingDetail from "../pages/waiting-list/WaitingListBookingDetail";
import AreaRedirect from "../pages/areas/AreaRedirect";

const locationRoutes = (queryClient: QueryClient) => [
  {
    path: "/locations/:locationId/areas",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <AreaRedirect />
        </ProtectedRoute>
      </Suspense>
    ),
    loader: async ({ params }: Params<string>) => {
      // @ts-expect-error - react sees it as a string when it can be an object
      return bookingAreasLoader(queryClient)(params as BookingAreaParams);
    },
  },
  {
    path: "/locations/:locationId/areas/:areaId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <Booking />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/locations/:locationId/areas/:areaId/waiting-list/join",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <WaitingListJoin />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/locations",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <Locations />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/location/:locationId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <LocationDetails />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/bookings",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/bookings/:bookingId/confirmed",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <BookingConfirmed />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/bookings/:bookingId/details",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <BookingDetails />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/waiting-list/:waitingListId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <WaitingListBookingDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/waiting-list/:waitingListId/confirmed",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <WaitingListConfirmed />
        </ProtectedRoute>
      </Suspense>
    ),
  },
];

export default locationRoutes;
