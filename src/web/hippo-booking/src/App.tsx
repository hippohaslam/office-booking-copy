import "./App.scss";
import { Outlet } from "react-router-dom";
// import Nav from "./components/nav/Nav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAxiosInterceptors from "./hooks/AxiosInterceptor";

const queryClient = new QueryClient();

// This is effectivly a Layout component that wraps the Nav and Outlet components
function App() {
  useAxiosInterceptors();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
          <Outlet />
      </div>
    </QueryClientProvider>
  );
}

export default App;
