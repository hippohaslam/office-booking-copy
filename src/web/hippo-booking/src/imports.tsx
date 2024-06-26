import React from 'react';

// Admin
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard.tsx'));
const FloorplanEditor = React.lazy(() => import('./pages/admin/locations/floorplan-editor/FloorplanEditor.tsx'));

// Location/booking
const Booking = React.lazy(() => import('./pages/locations/booking/Booking.tsx'));
const Locations = React.lazy(() => import('./pages/locations/Locations.tsx'));


// export parking component
export { Booking, FloorplanEditor, Locations, Dashboard };