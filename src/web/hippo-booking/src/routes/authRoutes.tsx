import { Suspense } from "react";
import SignIn from "../pages/signin/SignIn";

const authRoutes = [
  {
    path: "/signin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SignIn />
      </Suspense>
    ),
  },
];

export default authRoutes;
