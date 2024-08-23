import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useAxiosInterceptors() {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          navigate("/signin");
        } else if (error.response && error.response.status === 404) {
          navigate("/not-found");
        }
        return Promise.reject(error);
      },
    );

    // Cleanup function to remove interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]); // Depend on navigate to ensure stability
}

export default useAxiosInterceptors;
