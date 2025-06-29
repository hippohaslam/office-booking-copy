import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { getLocationsAsync } from "../../services/Apis";
import { ActionTile, ActionTileList, Breadcrumbs, ErrorBanner } from "../../components";
import { compareAlphabeticallyByPropertyWithNumbers } from "../../helpers/ArrayHelpers";

const Locations = () => {
  const { isFetching, error, data } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocationsAsync()(),
    //staleTime: 1000 * 60 * 60, // 1 hour. TODO: Set for production use, extend time to a day?
  });

  const listItems =
    data?.sort((a, b) => compareAlphabeticallyByPropertyWithNumbers(a, b, "name"))
      .map((location) => (
        <ActionTile
          title={location.name}
          primaryLink={{ show: true, to: `/locations/${location.id}/areas`, text: "Book at this location" }}
          secondaryLink={{ show: true, to: `/location/${location.id}`, text: "View more details" }}
          tileTestId="location-tile"
        />
    )) || [];

  if (error) {
    return <ErrorBanner isShown={true} title='Error' errorMessage='Unable to get locations, please refresh the page' allowClose={false} />;
  }

  if (isFetching) {
    return (
      <div>
        <span>Fetching locations...</span>
      </div>
    );
  }

  const breadcrumbItems = [
    { to: "/", text: "Home" }, 
    { to: "", text: "Locations" }
  ];

  return (
    <>
      <Helmet>
        <title>Choose a location | Make a new booking | Hippo Reserve</title>
      </Helmet>
      <Breadcrumbs items={breadcrumbItems}/>
      <h1>Choose a location</h1>
      {data?.length === 0 ? <p>Uh oh! no locations found...</p> : <ActionTileList listItems={listItems} />}
    </>
  );
};

export default Locations;
