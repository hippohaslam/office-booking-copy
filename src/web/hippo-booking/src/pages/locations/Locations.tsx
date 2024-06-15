import { useQuery } from "@tanstack/react-query";
import { getLocationsAsync } from "../../services/Apis";
import { Link } from "react-router-dom";
import { ErrorBanner } from "../../components/banners/Banners";

const Locations = () => {
  const { isFetching, error, data } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocationsAsync,
    //staleTime: 1000 * 60 * 60, // 1 hour. TODO: Set for production use, extend time to a day?
  });

  if (error) {
    return <ErrorBanner text="Unable to get locations, please refresh the page" />;
  }

  if (isFetching) {
    return <div>Fetching locations...</div>;
  }

  return (
    <div>
      <h1>Locations</h1>
      <ul className="locations-list">
        {data?.map((office) => (
          <li key={office.id}>
            <Link to={`/locations/booking/${office.id}`}>{office.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Locations;
