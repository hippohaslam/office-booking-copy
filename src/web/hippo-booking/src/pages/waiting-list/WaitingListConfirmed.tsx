import "./WaitingListConfirmed.scss";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ErrorBanner, BookingCardStacked, ConfirmationInformation } from "../../components";
import { getLocationAsync, getWaitingListBookingAsync } from "../../services/Apis";
import { Area } from "../../interfaces/Area";
import Graphic from "../../assets/big-tick-icon.svg";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import NotFoundPage from "../error/NotFound";

const WaitingListConfirmed = () => {
  const { waitingListFeature } = useFeatureFlags();
  const { waitingListId } = useParams();

  if (!waitingListFeature) {
    return <NotFoundPage />;
  }

  const { isFetching, error, data } = useQuery({
    queryKey: ["waiting-list-booking", waitingListId],
    queryFn: () => getWaitingListBookingAsync(+waitingListId!),
    enabled: !!waitingListId,
  });

  const {
    isFetching: isFechingLocation,
    error: errorLocation,
    data: locationData,
  } = useQuery({
    queryKey: ["location", data?.location.id],
    queryFn: () => getLocationAsync()(data!.location.id.toString()),
    enabled: !!data?.location.id,
  });

  const areaInformation = locationData?.areas.find((area: Area) => area.id === data?.area.id);

  if (error || errorLocation) {
    return (
      <div className='content-container'>
        <ErrorBanner
          allowClose={false}
          isShown={true}
          title='Something went wrong'
          errorMessage={"There was an error retrieving the data: " + error?.message}
        />
      </div>
    );
  }

  if (isFetching || isFechingLocation) {
    return (
      <div className='content-container'>
        <span>Fetching booking...</span>
      </div>
    );
  }

  return (
    <div>
      <title>{"Join waiting list confirmed | Hippo Reserve"}</title>
      <Link to='/'>Back to home page</Link>
      <div className='confirmed-page-heading'>
        <img alt='' className='confirmed-page-tick-graphic' src={Graphic}></img>
        <h1>Join waiting list confirmed</h1>
      </div>
      {data && (
        <div>
          <h2>Your wait list details:</h2>
          <BookingCardStacked
            date={data.dateToBook}
            bookableObjectName={""}
            areaName={locationData!.name}
            locationName={areaInformation!.name}
            color='hippo-brand-bluey-grey'
          />
          <p>You will receive a Slack message confirming when a booking occurs.</p>
        </div>
      )}

      {locationData && <ConfirmationInformation locationData={locationData} />}

      <br />
    </div>
  );
};

export default WaitingListConfirmed;
