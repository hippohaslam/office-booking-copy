import { Suspense } from "react";
import { Dashboard, CreateLocation, CreateArea, SvgAreaEditor, FloorplanEditor } from "../imports";
import {AdminProtectedRoute} from "../ProtectedRoute";

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
