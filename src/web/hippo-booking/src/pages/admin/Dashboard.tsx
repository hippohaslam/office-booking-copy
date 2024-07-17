import { useQueries, useQuery } from "@tanstack/react-query";
import { ErrorBanner } from "../../components";
import { getLocationAreasAsync, getLocationsAsync } from "../../services/Apis";
import { Link, useNavigate } from "react-router-dom";
import { CtaButton } from "../../components/buttons/Buttons";
import './Dashboard.scss'

const Admin = () => {
  const navigate = useNavigate();

  const {
    isFetching,
    error,
    data: locationData,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocationsAsync,
  });

  const locationDetailsQueries = useQueries({
    queries:
      locationData?.map((location) => ({
        queryKey: ["locationDetails", location.id],
        queryFn: () => getLocationAreasAsync(location.id),
        enabled: !!locationData,
      })) || [],
  });

  //return a list of areas belong to a given locationId
  const getAreas = (locationId: number) => {
    return locationDetailsQueries.flatMap((query) => query.data?.filter((x) => x && x.locationId === locationId) || []);
  };

  const handleAddNewLocation = () => {
    navigate("/admin/locations/new");
  };

  const handleAddArea = (locationId: number) => {
    navigate(`/admin/locations/${locationId}/areas/new`);
  };

  if (error || locationDetailsQueries.some((query) => query.isError)) {
    return (
      <div>
        <ErrorBanner text="Unable to get locations, please try again" />
      </div>
    );
  }

  if (isFetching || locationDetailsQueries.some((query) => query.isLoading)) {
    return (
      <div>
        <span>Fetching locations...</span>
      </div>
    );
  }

  return (
    <div>
      <h2>Edit locations</h2>
      <CtaButton text="Add a new location" color="cta-green" onClick={handleAddNewLocation} />
      {locationData?.length === 0 && <p>No locations found. Create a your first location!</p>}
      {locationData?.map((location) => (
        <div key={location.id} className="location-and-area">
          <h3 className="location-and-area__header">{location.name}</h3>
          <button type="button" className="location-and-area__cta" onClick={() => handleAddArea(location.id)}>
            Add area
          </button>
          {getAreas(location.id).length === 0 && <p>No areas yet for this location. =(</p>}
          <ul>
            {/* Get all the areas of this location */}
            {getAreas(location.id).map((area) => (
              <li key={area.id}>
                <Link to={`/admin/locations/${location.id}/area/${area.id}`}>{area.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Admin;
