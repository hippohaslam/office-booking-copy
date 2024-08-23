import { useQuery } from "@tanstack/react-query";
import { getLocationsAsync } from "../../services/Apis";
import { ActionTile, ActionTileList, ErrorBanner } from '../../components';

// TODO: Add location type so we know what's parking and whats an office.

const Locations = () => {
  const { isFetching, error, data } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocationsAsync()(),
    //staleTime: 1000 * 60 * 60, // 1 hour. TODO: Set for production use, extend time to a day?
  });

  const listItems = 
    data?.map(location => (
    <ActionTile 
      title={location.name} 
      primaryLink={{show: true, to: `/locations/${location.id}/areas`, text: "Book at this location"}}
      secondaryLink={{show: true, to: `/location/${location.id}`, text: "View more details" }}/>
    )) || [];

  if (error) {
    return <ErrorBanner isShown={true} title="Error" errorMessage="Unable to get locations, please refresh the page" allowClose={false} />;
  }

  if (isFetching) {
      return <div><span>Fetching locations...</span></div>;
  }

  return (
      <>
        <h1>Choose a location</h1>
        {data?.length === 0 
          ? <p>Uh oh! no locations found...</p> 
          : <ActionTileList listItems={listItems} />}
        
      </>
  );
};

export default Locations;
