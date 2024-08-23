import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/global.scss";

const queryClient = new QueryClient();

// This is effectivly a Layout component that wraps the Nav and Outlet components
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='app-container'>
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}

export default App;
