import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./contexts/UserContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import routes from './routes';

const queryClient = new QueryClient();

const router =  createBrowserRouter([...routes(queryClient)]
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