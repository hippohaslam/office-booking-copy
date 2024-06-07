import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
  resetUpdateSuccess: () => void;
}

// This will likely need more work to handle more complex API calls
// Alternative would be to use a third party library
// Axios may also be better than fetch as it has more features like interceptors and cancellation
const useFetch = <T,>(url: string, method = 'GET', initialData?: T, postData?: T): FetchState<T> => {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setSuccess(false);
      try {
        const options = postData
          ? {
              method: method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(postData),
            }
          : {};

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        if (postData !== undefined) {
          setSuccess(true);
        } else {
          const data = await response.json();
          setData(data);
        }
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error);
        setSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, postData, method]);

  const resetUpdateSuccess = () => setSuccess(false);

  return { data, isLoading, error, success, resetUpdateSuccess };
};

export default useFetch;
