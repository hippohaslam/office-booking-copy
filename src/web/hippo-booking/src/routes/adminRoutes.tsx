import { Suspense } from "react";
import {
  Dashboard,
  CreateLocation,
  CreateArea,
  SvgAreaEditor,
  FloorplanEditor,
  ReportingDashboard,
  Report,
  EditLocation,
  AdminBookings,
  DeleteBooking,
} from "../imports";
import { AdminProtectedRoute } from "../ProtectedRoute";

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <Dashboard />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/bookings",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <AdminBookings />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/bookings/:bookingId/delete",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <DeleteBooking />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/reporting",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <ReportingDashboard />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/reporting/:reportId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <Report />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/new",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <CreateLocation />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <EditLocation />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/areas/new",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminProtectedRoute>
          <CreateArea />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/area/:areaId/svg-editor",
    element: (
      <Suspense fallback={<div>Loading editor...</div>}>
        <AdminProtectedRoute>
          <SvgAreaEditor />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/area/:areaId",
    element: (
      <Suspense fallback={<div>Loading editor...</div>}>
        <AdminProtectedRoute>
          <FloorplanEditor />
        </AdminProtectedRoute>
      </Suspense>
    ),
  },
];

export default adminRoutes;
