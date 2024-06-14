import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.scss'
import { Parking, DeskBooking, FloorplanEditor } from './imports.tsx'
import ErrorPage from './pages/error/Error.tsx';
import Home from './pages/home/Home.tsx';


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
        path: "/desk",
        element: <Suspense fallback={<div>Loading...</div>}><DeskBooking /></Suspense>,
      },
      {
        path: "parking",
        element: <Suspense fallback={<div>Loading...</div>}><Parking /></Suspense>
      },
      {
        path: "/locations",
        element: <div>List of locations</div>
      },
      {
        path: "/locations/:locationId/editor",
        element: <Suspense fallback={<div>Loading editor...</div>}><FloorplanEditor /></Suspense>
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
