import "./App.scss";
import { Outlet } from "react-router-dom";
import Nav from "./components/nav/Nav";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// This is effectivly a Layout component that wraps the Nav and Outlet components
function App() {
  return (
    <QueryClientProvider client={queryClient}>
          <div className="app-container">
            <Nav />
            <main>
              <Outlet />
            </main>
            <footer>A footer</footer>
          </div>
    </QueryClientProvider>
  );
}

export default App;
