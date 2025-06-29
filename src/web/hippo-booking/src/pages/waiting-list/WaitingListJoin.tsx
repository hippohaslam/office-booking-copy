import {useParams, useNavigate, useSearchParams, Link} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addToWaitingListAsync, getLocationAsync, getWaitingListAsync } from "../../services/Apis";
import { Area } from "../../interfaces/Area";
import { useEffect, useState } from "react";
import {BookingCardStacked, Breadcrumbs, CtaButton, ErrorBanner} from "../../components";
import { BookingWaitListDequeueTime } from "../../constants/BookingConstants";
import { toLocaleDateUk } from "../../helpers/DateHelpers";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import NotFoundPage from "../error/NotFound";

const WaitingListJoin = () => {
  const { waitingListFeature } = useFeatureFlags();
  const { locationId, areaId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [postError, setPostError] = useState<string | null>(null);

  if (!waitingListFeature) {
    return <NotFoundPage />;
  }

  const date = searchParams.get("date");

  const {
    data: locationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAsync()(locationId!),
    enabled: !!locationId,
  });

  const { data: waitListData, isLoading: waitListLoading } = useQuery({
    queryKey: ["waitList", areaId, date],
    queryFn: () => getWaitingListAsync(+areaId!, new Date(date!)),
    enabled: !!areaId && !!date,
  });

  const addMutation = useMutation({
    mutationFn: () => addToWaitingListAsync(+areaId!, new Date(date!)),
    onSuccess: (data) => {
      navigate(`/waiting-list/${data}/confirmed`);
    },
    onError: (error) => {
      setPostError(error.message);
    },
  });

  useEffect(() => {
    // A way to check that a date is passed in the query params
    if (locationData && !date) {
      navigate(`/locations/${locationId}/areas/${areaId}`);
    }
    if (locationData) {
      // check if the areaId is in the locationData.areas
      // If not then redirect them back to 404 page not-found
      const areaExists = locationData.areas.some((area: Area) => String(area.id) === String(areaId));
      if (!areaExists) {
        navigate("/not-found");
      }
    }
  }, [locationData, date]);

  const handleConfirm = () => {
    addMutation.mutate();
  };

  const handleCancel = () => {
    if (locationId && areaId) {
      navigate(`/locations/${locationId}/areas/${areaId}`);
    } else {
      navigate("/");
    }
  };

  const areaName = locationData?.areas?.find((area: Area) => String(area.id) === String(areaId))?.name;

  const breadcrumbItems = [
    { to: "/", text: "Home" },
    { to: "/locations", text: "Locations" },
    {
      to: "/locations/" + locationData?.id! + `/areas`,
      text: locationData?.name ?? "Location",
    },
    {
      to: "/locations/" + locationData?.id! + `/areas/${areaId}`,
      text: areaName ?? "Area",
    },
    {
      to: "",
      text: "Join waiting list",
    },
  ];

  if (isLoading || waitListLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Failed to load location data.</p>;
  }

  const isAlreadyInQueue = waitListData?.queuePosition !== null && waitListData?.queuePosition !== undefined;

  return (
      <div>
        <title>Join waiting list | Hippo Reserve</title>
        <Breadcrumbs items={breadcrumbItems}/>
        <ErrorBanner isShown={!!postError} title='Failed to join waiting list' errorMessage='' allowClose={false}/>


        {!locationData || (!locationData.areas && (
                <>
                  <h1>
                    Join waiting list for {areaName} in {locationData?.name}
                  </h1>
                  <p>Location or area data is unavailable.</p>
                </>
            )
        )}

        {locationData && locationData.areas && areaName &&(
            <>
              {isAlreadyInQueue ? (
                  <>
                    <h1>
                      You are on the waiting list for {areaName} in {locationData.name}
                    </h1>
                    <p>
                      You are already in
                      {" "}<strong>position {waitListData?.queuePosition} of {waitListData?.queueLength}</strong>{" "}
                      on the waiting list for {areaName} on {toLocaleDateUk(new Date(date!))}.
                    </p>
                    <p>
                      Please note that your waiting list place will be automatically removed at{" "}
                      <strong>{BookingWaitListDequeueTime.friendlyTime}</strong> on {toLocaleDateUk(new Date(date!))}.
                    </p>
                    <p>Manage your waiting list places on the <Link to={`/bookings`}>My Bookings page</Link>.</p>
                  </>
              ) : (
                  <>
                    <h1>
                      Join waiting list for {areaName} in {locationData.name}
                    </h1>
                    <p>
                      Joining the waiting list will automatically book you into a desk/parking place as soon as one
                      becomes available.
                    </p>
                    <p>
                      You can visit the <Link to='/bookings'>My Bookings page</Link> to cancel your spot on the
                      waiting list if you no longer wish to remain on it.
                    </p>

                    <h2>
                      Would you like to join this waiting list?
                    </h2>
                    <p>There are currently {waitListData?.queueLength} people on this waiting list.</p>
                    <BookingCardStacked date={new Date(date!)} areaName={areaName} locationName={locationData.name}
                                        color={"hippo-brand-light-grey"}/>
                    <p>
                      Please note that your waiting list place will be automatically removed at{" "}
                      <strong>{BookingWaitListDequeueTime.friendlyTime}</strong> on {toLocaleDateUk(new Date(date!))}.
                    </p>
                  </>
              )}
            </>
        )}

        <div className='cta-button-group'>
          {isAlreadyInQueue ? (
              <CtaButton onClick={handleCancel} text='Go back' color='cta-grey'/>
          ) : (
              <>
                <CtaButton onClick={handleConfirm} text='Yes. Join waiting list' color='cta-green'/>
                <CtaButton onClick={handleCancel} text='No. Cancel' color='cta-grey'/>
              </>
          )}
        </div>

      </div>
  );
};

export default WaitingListJoin;
