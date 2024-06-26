import React from 'react';

const Parking = React.lazy(() => import('./pages/parking-booking/parking.tsx'));
const Booking = React.lazy(() => import('./pages/booking/Booking.tsx'));
const FloorplanEditor = React.lazy(() => import('./pages/admin/locations/floorplan-editor/FloorplanEditor.tsx'));
const Locations = React.lazy(() => import('./pages/booking/Locations.tsx'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard.tsx'));

// export parking component
export { Parking, Booking, FloorplanEditor, Locations, Dashboard };