import { useQuery } from "@tanstack/react-query";
import { getLocationsAsync } from "../../services/Apis";
import { Link } from "react-router-dom";
import { ErrorBanner } from '../../components';

// TODO: Add location type so we know what's parking and whats an office.

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
    <div className="page-container">
      <section className="full-width-standard-grey">
          <div className="content-container">
            <h1>Locations</h1>
            <ul className="locations-list">
              {data?.map((location) => (
                <li key={location.id}>
                  <Link to={`/locations/${location.id}/areas`}>{location.name}</Link>
                </li>
              ))}
            </ul>
          </div>
      </section>
    </div>
  );
};

export default Locations;
