import { Suspense } from "react";
import { Dashboard, CreateLocation, CreateArea, SvgAreaEditor, FloorplanEditor } from "../imports";
import ProtectedRoute from "../ProtectedRoute";

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/new",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <CreateLocation />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/areas/new",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <CreateArea />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/area/:areaId/svg-editor",
    element: (
      <Suspense fallback={<div>Loading editor...</div>}>
        <ProtectedRoute>
          <SvgAreaEditor />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/locations/:locationId/area/:areaId",
    element: (
      <Suspense fallback={<div>Loading editor...</div>}>
        <ProtectedRoute>
          <FloorplanEditor />
        </ProtectedRoute>
      </Suspense>
    ),
  },
];

export default adminRoutes;
