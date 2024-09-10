import { Link, useParams } from "react-router-dom";
import { getLocationAsync } from "../../../services/Apis";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs, CtaLink, ErrorBanner, InfoTile, InfoTileList } from "../../../components";
import { isNotNullOrEmpty } from "../../../helpers/StringHelpers";
import "./LocationDetails.scss";

const LocationDetails = () => {
  const { locationId } = useParams();

  const { isFetching, error, data } = useQuery({
    queryKey: ["location"],
    queryFn: () => getLocationAsync()(locationId!),
  });

  if (error) {
    return <ErrorBanner isShown={true} title='Error' errorMessage='Unable to get location, please refresh the page' allowClose={false} />;
  }

  if (isFetching) {
    return (
      <div>
        <span>Fetching location...</span>
      </div>
    );
  }

  const encodedAddress = encodeURIComponent(data?.address ?? "");

  return (
    <div>
      <Breadcrumbs items={[{text: "Home", to: "/"}, {text: "Locations", to: "/locations"}, {text: data?.name ?? "Details", to: "{}"}]}/>
      <h1>{data?.name}</h1>
      <iframe className="map" src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`} width="100%" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      <InfoTileList>
        <InfoTile>
          <h2>Description</h2>
          <p>{data?.description}</p>
        </InfoTile>

        <InfoTile>
          <h2>Address</h2>
          <p>
            {data?.address.split(", ").map((part, index, array) => (
              <span key={index}>
              {part}
              {index < array.length - 1 && ","}
              <br />
              </span>
            ))}
          </p>
          <Link target="_blank" to={"https://www.google.com/maps/dir/?api=1&destination=" + encodedAddress}>Get directions to this location on Google Maps</Link>
        </InfoTile>

        
        {isNotNullOrEmpty(data?.slackChannel) ? (
          <InfoTile>
            <h2>Slack channel</h2>
            <p>The office Slack channel is the best place to get updates, ask questions and socialise with other Hippos who use this location.</p>
            <Link to={data.slackChannel ?? "/"} target="_blank">Join the {data.name} Slack channel</Link>
          </InfoTile>
        ) : <></>}

        {isNotNullOrEmpty(data?.guideLink) ? (
          <InfoTile>
            <h2>Office guide</h2>
            <p>The office guide includes detailed information about accessing the office, facilities, meeting spaces, guests, events and much more.</p>
            <Link to={data.guideLink} target="_blank">Read the {data.name} office guide on Google Drive</Link>
          </InfoTile>
        ) : <></>}
      </InfoTileList>

      <CtaLink text={"Make a booking at " + data?.name} to={"/locations/" + locationId + "/areas"} color="cta-green" withArrow={true}/>
    </div>
  );
};

export default LocationDetails;
