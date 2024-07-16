import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard, FloorplanEditor, Booking, Locations, BookingAreas, SvgAreaEditor } from "./imports";
import ErrorPage from "./pages/error/Error.tsx";
import Home from "./pages/home/Home.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import SignIn from "./pages/signin/SignIn.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./contexts/UserContext.tsx";
import { FullContentPageLayout, BaseLayout, SignInLayout } from "./layouts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";

const queryClient = new QueryClient();

const router =  createBrowserRouter([
    {
        element: <App/>,
        children: [
            {
                path: "/",
                element: <BaseLayout/>,
                errorElement: <ErrorPage/>,
                children: [
                    {
                        path: "/",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <Home/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/admin/locations/:locationId/area/:areaId",
                        element: (
                            <Suspense fallback={<div>Loading editor...</div>}>
                                <ProtectedRoute>
                                    <FloorplanEditor/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/locations/:locationId/areas/:areaId",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <Booking/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                element: <FullContentPageLayout/>,
                children: [
                    {
                        path: "/locations/:locationId/areas",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <BookingAreas/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/locations/:locationId/areas",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <BookingAreas/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/locations",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <Locations/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/locations",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <Locations/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        path: "/admin",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <ProtectedRoute>
                                    <Dashboard/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                    {
                        // Experimental route
                        path: "/admin/locations/:locationId/area/:areaId/svg-editor",
                        element: (
                            <Suspense fallback={<div>Loading editor...</div>}>
                                <ProtectedRoute>
                                    <SvgAreaEditor/>
                                </ProtectedRoute>
                            </Suspense>
                        ),
                    },
                ]
            },
            {
                element: <SignInLayout/>,
                children: [
                    {
                        path: "/signin",
                        element: (
                            <Suspense fallback={<div>Loading...</div>}>
                                <SignIn/>
                            </Suspense>
                        ),
                    }
                ]
            }]
    }]
);

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Root element not found");
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <UserProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);