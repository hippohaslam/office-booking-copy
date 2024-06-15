import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ErrorBanner } from "../../components/banners/Banners";
import { getLocationsAsync } from "../../services/Apis";

const Admin = () => {
    const [showModal, setShowModal] = useState(false);
  const { isFetching, error, data } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocationsAsync,
  });

  // const handleAddNewLocation = () => {
  //   // TODO: Figure out how to add a new location
  //   // possibly a modal or a new page
  //   console.log("Add new location btn clicked");
  //   setShowModal(true);
  // }

  if (error) {
    return <ErrorBanner text="Unable to get locations, please try again" />;
  }

  if (isFetching) {
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
        <ul className="locations-list">
          {data?.map((location) => (
            <li key={location.id}>
              <Link to={`/locations/${location.id}/editor`}>{location.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
