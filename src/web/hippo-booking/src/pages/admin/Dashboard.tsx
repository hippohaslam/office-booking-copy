import { useQueries, useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { CtaLink, ErrorBanner, IconLink } from "../../components";
import { getLocationAreasAsync, getLocationsAsync } from "../../services/Apis";
import { Link } from "react-router-dom";
import "./Dashboard.scss";
import AddIcon from "../../assets/add-icon.svg";

const Admin = () => {
  const {
    isFetching,
    error,
    data: locationData,
  } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => getLocationsAsync(true)(),
  });

  const locationDetailsQueries = useQueries({
    queries:
      locationData?.map((location) => ({
        queryKey: ["locationDetails", location.id],
        queryFn: () => getLocationAreasAsync(true)(location.id),
      })) || [],
  });

  //return a list of areas belong to a given locationId
  const getAreas = (locationId: number) => {
    return locationDetailsQueries.flatMap((query) => query.data?.filter((x) => x && x.locationId === locationId) || []);
  };

  if (error || locationDetailsQueries.some((query) => query.isError)) {
    return (
      <div>
        <ErrorBanner isShown={true} title='Error' errorMessage='Unable to get locations, please try again' allowClose={false} />
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
      <Helmet>
        <title>Admin | Hippo Reserve</title>
      </Helmet>
      <h1>Admin</h1>
      <div>
        <h2>Reporting</h2>
        <Link to='/admin/reporting'>Go to reporting dashboard</Link>
      </div>
      <br />
      <div>
        <h2>Bookings</h2>
        <Link to='/admin/bookings'>Go to manage bookings</Link>
      </div>
      <br />
      <h2>Locations</h2>
      {locationData?.length === 0 && <p>No locations found. Create a your first location!</p>}
      <ul className='admin-card-list'>
        {locationData?.map((location) => (
          <li key={location.id} className='admin-card' data-testid='location-container'>
            <div>
              <h3 className='admin-card__header'>{location.name}</h3>
              <Link to={`/admin/locations/${location.id}`}>View and edit location details</Link>
            </div>
            <div>
              <h4>Areas</h4>
              {getAreas(location.id).length === 0 && <p>There are no areas yet for this location. &#128533;</p>}
              <ul>
                {/* Get all the areas of this location */}
                {getAreas(location.id).map((area) => (
                  <li key={area.id}>
                    <Link to={`/admin/locations/${location.id}/area/${area.id}`}>{area.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <IconLink
              title={`Add new area for ${location.name}`}
              color='navy'
              iconSrc={AddIcon}
              to={`/admin/locations/${location.id}/areas/new`}
              showBorder={true}
              showText={true}
            />
          </li>
        ))}
      </ul>
      <CtaLink text='Add a new location' color='cta-green' to='/admin/locations/new' />
    </div>
  );
};

export default Admin;
