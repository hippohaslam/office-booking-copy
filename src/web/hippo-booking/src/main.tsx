import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.scss";
import { Parking, Dashboard, FloorplanEditor, Booking, Locations } from "./imports";
import ErrorPage from "./pages/error/Error.tsx";
import Home from "./pages/home/Home.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import SignIn from "./pages/signin/SignIn.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./contexts/UserContext.tsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/signin",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
              <SignIn />
          </Suspense>
        ),
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/admin/locations/:locationId",
        element: (
          <Suspense fallback={<div>Loading editor...</div>}>
            <ProtectedRoute>
              <FloorplanEditor />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/booking",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <Locations />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/locations/:locationId/booking",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        // This may get removed, can't see a use for it with locations
        path: "parking",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Parking />
          </Suspense>
        ),
      },
    ],
  },
]);

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Root element not found");
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
