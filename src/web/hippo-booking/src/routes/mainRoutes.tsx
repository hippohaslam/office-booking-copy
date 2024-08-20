import { Suspense } from "react";
import { BookingAreas, Booking, Locations } from "../imports";
import { BookingAreaParams, bookingAreasLoader } from "../loaders/BookingAreaLoader";
import ErrorPage from "../pages/error/Error";
import ProtectedRoute from "../ProtectedRoute";
import { Params } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import Bookings from "../pages/bookings/Bookings";
import BookingConfirmed from "../pages/bookings/bookingConfirmed/BookingConfirmed";
import LocationDetails from "../pages/locations/locationDetails/LocationDetails";

const locationRoutes = (queryClient: QueryClient) => [
    {
        path: "/locations/:locationId/areas",
        errorElement: <ErrorPage />,
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <BookingAreas/>
                </ProtectedRoute>
            </Suspense>
        ),
        loader: async ({ params }: Params<string>) => {
            // @ts-expect-error - react sees it as a string when it can be an object
            return bookingAreasLoader(queryClient)(params as BookingAreaParams);
        }
    },
    {
        path: "/locations/:locationId/areas/:areaId",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <Booking/>
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/locations",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <Locations/>
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/location/:locationId",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <LocationDetails/>
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/bookings",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <Bookings/>
                </ProtectedRoute>
            </Suspense>
        )
    },
    {
        path: "/bookings/:bookingId/confirmed",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                    <BookingConfirmed/>
                </ProtectedRoute>
            </Suspense>
        )
    }
]

export default locationRoutes;