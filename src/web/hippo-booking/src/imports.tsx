import React from "react";

// Admin
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard.tsx"));
const FloorplanEditor = React.lazy(() => import("./pages/admin/area/area-editor-fabric/AreaEditorFabric.tsx"));
const CreateLocation = React.lazy(() => import("./pages/admin/locations/CreateLocation.tsx"));
const CreateArea = React.lazy(() => import("./pages/admin/area/CreateNewArea.tsx"));
const ReportingDashboard = React.lazy(() => import("./pages/admin/reporting/Dashboard.tsx"));
const Report = React.lazy(() => import("./pages/admin/reporting/Report.tsx"));

// Location/booking
const Booking = React.lazy(() => import("./pages/bookings/new-booking/NewBooking.tsx"));
const Locations = React.lazy(() => import("./pages/locations/Locations.tsx"));
const EditLocation = React.lazy(() => import("./pages/admin/locations/EditLocation.tsx"));
const BookingAreas = React.lazy(() => import("./pages/areas/BookingAreas.tsx"));
const SvgAreaEditor = React.lazy(() => import("./pages/admin/area/area-editor-svg/AreaEditorSvg.tsx"));

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
  ReportingDashboard,
  Report,
};
