import { useState, useEffect } from "react";

const useFetchData = (fetchFunction, id, refetch) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetchFunction(id);
        const fetchedData = res?.data;
        setData(fetchedData || {});
      } catch (err) {
        // toast.error(err?.response?.data?.message || err?.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data only if it is not undefined
    if (id !== undefined) {
      fetchData();
    }
  }, [fetchFunction, id, refetch]);

  return { data, loading };
};

export default useFetchData;
