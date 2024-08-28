import React from "react";

// Admin
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard.tsx"));
const FloorplanEditor = React.lazy(() => import("./pages/admin/locations/area/area-editor-fabric/AreaEditorFabric.tsx"));
const CreateLocation = React.lazy(() => import("./pages/admin/locations/CreateLocation.tsx"));
const CreateArea = React.lazy(() => import("./pages/admin/locations/area/CreateNewArea.tsx"));

// Location/booking
const Booking = React.lazy(() => import("./pages/locations/booking/Booking.tsx"));
const Locations = React.lazy(() => import("./pages/locations/Locations.tsx"));
const EditLocation = React.lazy(() => import("./pages/admin/locations/EditLocation.tsx"));
const BookingAreas = React.lazy(() => import("./pages/locations/areas/BookingAreas.tsx"));
const SvgAreaEditor = React.lazy(() => import("./pages/admin/locations/area/area-editor-svg/AreaEditorSvg.tsx"));

// export parking component
export {
  Booking,
  FloorplanEditor,
  Locations,
  EditLocation,
  Dashboard,
  BookingAreas,
  SvgAreaEditor,

  // Admin
  CreateLocation,
  CreateArea,
};
