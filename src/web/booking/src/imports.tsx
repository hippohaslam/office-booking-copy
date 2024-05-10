import React from 'react';

const Parking = React.lazy(() => import('./pages/parking-booking/parking.tsx'));
const DeskBooking = React.lazy(() => import('./pages/desk-booking/desk.tsx'));

// export parking component
export { Parking, DeskBooking };