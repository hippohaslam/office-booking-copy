import { useState } from "react";
import { createPortal } from "react-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ErrorBanner } from "../../components";
import {  getLocationAreasAsync, getLocationsAsync } from "../../services/Apis";
import { Link } from "react-router-dom";

const Admin = () => {
    const [showModal, setShowModal] = useState(false);
    
    const { isFetching, error, data: locationData } = useQuery({
      queryKey: ["locations"],
      queryFn: getLocationsAsync,
    });

  const locationDetailsQueries = useQueries({
    queries: locationData?.map((location) => ({
      queryKey: ['locationDetails', location.id],
      queryFn: () => getLocationAreasAsync(location.id),
      enabled: !!locationData,
    })) || [],
  });

  //return a list of areas belong to a given locationId
  const getAreas = (locationId: number) => {
    return locationDetailsQueries.flatMap(query => 
      query.data?.filter(x => x && x.locationId === locationId) || []
    );
  };

  if (error || locationDetailsQueries.some(query => query.isError)) {
    return <ErrorBanner text="Unable to get locations, please try again" />;
  }

  if (isFetching || locationDetailsQueries.some(query => query.isLoading)) {
    return <div>Fetching locations...</div>;
  }

  return (
    <div className={showModal ? "modal-backdrop" : ""}>
      <h1>Admin</h1>

      <div id="edit-locations">
        <h2>Edit locations</h2>
        {/* <button type="button" onClick={handleAddNewLocation}>Add new location</button> */}
        {showModal && createPortal(
        <div className="modal">
            <h2>Hello!</h2>
            <button onClick={() => setShowModal(false)}>Close</button>
        </div>,
        document.body
      )}
       <div>
    {locationData?.map((location) => (
      <div key={location.id}>
        <h3>{location.name}</h3>
        <ul>
          {/* Get all the areas of this location */}
          {getAreas(location.id).map((area) => (
            <li key={area.id}>
              <Link to={`/admin/locations/${location.id}/area/${area.id}`}>{area.name}</Link>
            </li>
          )
          )}
        </ul>
      </div>
    ))}
  </div>
      </div>
    </div>
  );
};

export default Admin;
