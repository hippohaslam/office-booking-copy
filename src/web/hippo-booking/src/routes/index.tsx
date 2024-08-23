import { Suspense } from "react";
import Home from "../pages/home/Home";
import { ProtectedRoute } from "../ProtectedRoute";
import App from "../App";
import { BaseLayout, FullContentPageLayout, SignInLayout } from "../layouts";
import ErrorPage from "../pages/error/Error";
import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";
import mainRoutes from "./mainRoutes";
import { QueryClient } from "@tanstack/react-query";
import NotFoundPage from "../pages/error/NotFound";

const indexRoutes = (queryClient: QueryClient) => [
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <BaseLayout />,
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
            path: "/not-found",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute>
                  <NotFoundPage />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <FullContentPageLayout />,
        errorElement: <ErrorPage />,
        children: [...mainRoutes(queryClient), ...adminRoutes],
      },
      {
        element: <SignInLayout />,
        errorElement: <ErrorPage />,
        children: [...authRoutes],
      },
    ],
  },
];

export default indexRoutes;
