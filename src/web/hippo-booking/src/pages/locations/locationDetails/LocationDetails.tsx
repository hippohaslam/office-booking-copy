import { useParams } from "react-router-dom";
import { getLocationAsync } from "../../../services/Apis";
import { useQuery } from "@tanstack/react-query";
import { CtaLink, ErrorBanner, WarningBanner } from "../../../components";

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

  return (
    <div>
      <WarningBanner
        isShown={true}
        title={"Page still under construction"}
        description="We're not quite finished building this page yet. Please check back soon."
      />
      <h1>{data?.name}</h1>
      <h2>Description</h2>
      <p>{data?.description}</p>
      <CtaLink text={"Make a booking at" + data?.name} to={"/locations/" + locationId + "/areas"} color="cta-green" withArrow={true}/>
    </div>
  );
};

export default LocationDetails;
