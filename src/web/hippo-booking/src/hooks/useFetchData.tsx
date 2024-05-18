import { useState, useEffect } from 'react';

type FetchData<T> = {
  data: T | null;
  loading: boolean;
  error: null | { message: string };
};

function useFetchData<T>(url: string): FetchData<T> {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

export default useFetchData;
