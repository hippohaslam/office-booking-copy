import { Link, useLoaderData, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ActionTile, ActionTileList, Breadcrumbs, ErrorBanner } from "../../components";
import { Area } from "../../interfaces/Area";
import OfficeIcon from "../../assets/office-icon.svg";
import ParkingIcon from "../../assets/parking-icon.svg";
import { AreaTypeEnum, AreaTypeEnumLabels } from "../../enums/AreaTypeEnum";
import { BookingLocation } from "../../interfaces/Location";
import { compareAlphabeticallyByPropertyWithNumbers } from "../../helpers/ArrayHelpers";

const BookingAreas = () => {
  const { areaData, locationData } = useLoaderData() as { areaData: Area[]; locationData: BookingLocation };
  const { locationId } = useParams();

  if (areaData.length === 0) {
    return (
      <div>
        <ErrorBanner
          isShown={true}
          title='Error'
          errorMessage='No areas found for this location. Please speak to facilities about this error.'
          allowClose={false}
        />
        <Link to='/locations'>Back to Choose a location</Link>
      </div>
    );
  }

  const listItems =
    areaData
      ?.sort((a, b) => compareAlphabeticallyByPropertyWithNumbers(a, b, "name"))
      .map((area) => (
        <ActionTile
          title={area.name}
          iconSrc={area.areaTypeId === AreaTypeEnum.Desks ? OfficeIcon : area.areaTypeId === AreaTypeEnum.CarPark ? ParkingIcon : undefined}
          description={AreaTypeEnumLabels[area.areaTypeId]}
          primaryLink={{ show: true, text: "Book in this area", to: `/locations/${locationId}/areas/${area.id}` }}
          secondaryLink={{ show: false }}
          tileTestId='area-tile'
        />
      )) || [];

  const breadcrumbItems = [
    { to: "/", text: "Home" },
    { to: "/locations", text: "Locations" },
    { to: "", text: locationData.name },
  ];

  return (
    <div>
      <Helmet>
        <title>{'Choose an area at ' + locationData.name +' | Make a new booking | Hippo Reserve'}</title>
      </Helmet>
      <Breadcrumbs items={breadcrumbItems} />
      <h1>{locationData.name}</h1>
      <h2>What would you like to book?</h2>
      <ActionTileList listItems={listItems} />
    </div>
  );
};

export default BookingAreas;
