import React from 'react';

const Parking = React.lazy(() => import('./pages/parking-booking/parking.tsx'));
const DeskBooking = React.lazy(() => import('./pages/booking/Booking.tsx'));
const FloorplanEditor = React.lazy(() => import('./pages/floorplan-editor/FloorplanEditor.tsx'));
const Locations = React.lazy(() => import('./pages/locations/Locations.tsx'));
const Admin = React.lazy(() => import('./pages/admin/Admin.tsx'));

// export parking component
export { Parking, DeskBooking, FloorplanEditor, Locations, Admin };