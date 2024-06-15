import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.scss'
import { Parking, Admin, FloorplanEditor, DeskBooking } from './imports.tsx'
import ErrorPage from './pages/error/Error.tsx';
import Home from './pages/home/Home.tsx';
import Locations from './pages/locations/Locations.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Suspense fallback={<div>Loading...</div>}><Home /></Suspense>,
      },
      {
        path: "/admin",
        element: <Suspense fallback={<div>Loading...</div>}><Admin /></Suspense>
      },
      {
        path: "/locations",
        element: <Suspense fallback={<div>Loading...</div>}><Locations /></Suspense>
      },
      {
        path: "/locations/:locationId/booking",
        element: <Suspense fallback={<div>Loading...</div>}><DeskBooking /></Suspense>
      },
      {
        path: "/locations/:locationId/editor",
        element: <Suspense fallback={<div>Loading editor...</div>}><FloorplanEditor /></Suspense>
      },
      {
        // This may get removed, can't see a use for it with locations
        path: "parking",
        element: <Suspense fallback={<div>Loading...</div>}><Parking /></Suspense>
      }
    ]
  },
  
]);

const root = document.getElementById("root");
if(root === null) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
