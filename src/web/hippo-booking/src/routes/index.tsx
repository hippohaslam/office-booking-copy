import { Suspense } from "react";
import Home from "../pages/home/Home";
import ProtectedRoute from "../ProtectedRoute";
import App from "../App";
import { BaseLayout, FullContentPageLayout, SignInLayout } from "../layouts";
import ErrorPage from "../pages/error/Error";
import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";
import mainRoutes from "./mainRoutes";
import { QueryClient } from "@tanstack/react-query";

const indexRoutes = (queryClient: QueryClient) => [
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
                ],
            },
            {
                element: <FullContentPageLayout/>,
                children: [
                    ...mainRoutes(queryClient),
                    ...adminRoutes
                ]
            },
            {
                element: <SignInLayout/>,
                children: [...authRoutes]
            }]
    }
    
    
]

export default indexRoutes;