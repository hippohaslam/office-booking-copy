import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.scss";
import { Dashboard, FloorplanEditor, Booking, Locations, BookingAreas, SvgAreaEditor } from "./imports";
import ErrorPage from "./pages/error/Error.tsx";
import Home from "./pages/home/Home.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import SignIn from "./pages/signin/SignIn.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./contexts/UserContext.tsx";
import FullPageContentLayout from "./layouts/fullContentPageLayout.tsx";
import BaseLayout from "./layouts/baseLayout.tsx";
import SignInLayout from "./layouts/signInLayout.tsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
        <BaseLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Suspense>
        </BaseLayout>
        ),
      },
      {
        path: "/signin",
        element: (
          <SignInLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <SignIn />
            </Suspense>
          </SignInLayout>
        ),
      },
      {
        path: "/admin",
        element: (
          <FullPageContentLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          </FullPageContentLayout>
        ),
      },
      {
        path: "/admin/locations/:locationId/area/:areaId",
        element: (
          <BaseLayout>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ProtectedRoute>
                <FloorplanEditor />
              </ProtectedRoute>
            </Suspense>
          </BaseLayout>
        ),
      },
      {
        // Experimental route
        path: "/admin/locations/:locationId/area/:areaId/svg-editor",
        element: (
          <Suspense fallback={<div>Loading editor...</div>}>
            <ProtectedRoute>
              <SvgAreaEditor />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/locations",
        element: (
          <FullPageContentLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            </Suspense>
          </FullPageContentLayout>
        ),
      },
      {
        path: "/locations/:locationId/areas",
        element: (
          <FullPageContentLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <ProtectedRoute>
                <BookingAreas />
              </ProtectedRoute>
            </Suspense>
          </FullPageContentLayout>
        ),
      },
      {
        path: "/locations/:locationId/areas/:areaId",
        element: (
          <BaseLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            </Suspense>
          </BaseLayout>
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
