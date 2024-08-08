import { useQuery } from "@tanstack/react-query";
import { getLocationsAsync } from "../../services/Apis";
import { ErrorBanner } from '../../components';
import { ActionTile, ActionTileList } from "../../components/tile/ActionTile";

// TODO: Add location type so we know what's parking and whats an office.

const Locations = () => {
  const { isFetching, error, data } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocationsAsync,
    //staleTime: 1000 * 60 * 60, // 1 hour. TODO: Set for production use, extend time to a day?
  });

  const listItems = 
    data?.map(location => (
    <ActionTile 
      title={location.name} 
      primaryLink={{show: true, to: `/locations/${location.id}/areas`, text: "Book at this location"}}
      secondaryLink={{show: true, to: "", text: "View more details" }}/>
    )) || [];

  if (error) {
    return <div><ErrorBanner text="Unable to get locations, please refresh the page" /></div>;
  }

  if (isFetching) {
      return <div><span>Fetching locations...</span></div>;
  }

  return (
      <div>
        <span>Make a new booking</span>
        <h1>Choose a location</h1>
        <ActionTileList listItems={listItems} />
      </div>
  );
};

export default Locations;
