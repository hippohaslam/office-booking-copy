import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import { Parking, DeskBooking } from './imports.tsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/desk",
    element: <DeskBooking />,
  },
  {
    path: "parking",
    element: <Suspense fallback={<div>Loading...</div>}><Parking /></Suspense>
  }
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
