import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteWaitingListBookingAsync, getWaitingListBookingAsync, getWaitingListAsync } from "../../services/Apis";
import { ConfirmModal, CtaButton, ErrorBanner, Table, BookingCardStacked } from "../../components";
import { BookingWaitListDequeueTime } from "../../constants/BookingConstants";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import NotFoundPage from "../error/NotFound";

const WaitingListBookingDetail = () => {
  const { waitingListFeature } = useFeatureFlags();
  const navigate = useNavigate();
  const { waitingListId } = useParams();
  const [cancelError, setCancelError] = useState<Error | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalLoading, setModalLoading] = useState(false);

  if (!waitingListFeature) {
    return <NotFoundPage />;
  }

  const { isFetching, error, data } = useQuery({
    queryKey: ["waiting-list-booking", waitingListId],
    queryFn: () => getWaitingListBookingAsync(Number(waitingListId)),
    enabled: !!waitingListId,
  });

  const { data: waitingListData, error: waitingListError } = useQuery({
    queryKey: ["waiting-list-position", data?.area.id, data?.dateToBook],
    queryFn: () => getWaitingListAsync(data?.area.id!, new Date(data?.dateToBook!)),
    enabled: !!data,
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: number) => {
      await deleteWaitingListBookingAsync(bookingId);
    },
    onSuccess: async () => {
      navigate(`/bookings`, { state: { cancelledWaitListBooking: data } });
    },
    onError: (_) => {
      setCancelError(new Error("Failed to cancel booking"));
    },
  });

  const handleCancelConfirm = () => {
    if (waitingListId) {
      setModalLoading(true);
      cancelBooking.mutate(parseInt(waitingListId));
    } else {
      console.log("Error with booking id");
    }
  };

  const handleCancelClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const bookingInfoElement = () => {
    if (data) {
      return (
        <div>
          <BookingCardStacked
            elementId='cancel-modal-booking-info'
            date={data.dateToBook}
            bookableObjectName={""}
            areaName={data.area.name}
            locationName={data.location.name}
          />
        </div>
      );
    } else {
      return <span>Booking data is null</span>;
    }
  };

  if (isFetching) {
    return (
      <div className='content-container'>
        <span>Fetching booking...</span>
      </div>
    );
  }

  if (error || waitingListError) {
    return (
      <div className='content-container'>
        <ErrorBanner
          allowClose={false}
          isShown={true}
          title='Something went wrong'
          errorMessage={`Failed to load booking: ${error?.message || waitingListError?.message}`}
        />
      </div>
    );
  }

  const formattedDateTime = new Date(data!.dateToBook).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <title>Booking details | Hippo Reserve</title>
      <Link to='/bookings'>Back to my bookings</Link>
      {cancelError !== null ? (
        <ErrorBanner isShown={true} title={"Error deleting this booking"} errorMessage={cancelError.message} allowClose={true} />
      ) : null}
      <br />
      <h1>Waiting list booking details</h1>

      <Table
        title={"Details"}
        columnHeadings={["Detail", "Value"]}
        rows={
          <>
            <tr>
              <td>Date</td>
              <td>{formattedDateTime}</td>
            </tr>
            <tr>
              <td>Area</td>
              <td>{data!.area.name}</td>
            </tr>
            <tr>
              <td>Location</td>
              <td>{data!.location.name}</td>
            </tr>
            {waitingListData && (
              <tr>
                <td>Position in queue</td>
                <td>
                  {waitingListData.queuePosition} of {waitingListData.queueLength}
                </td>
              </tr>
            )}
          </>
        }
        headerVisuallyHidden
      />
      {new Date(data!.dateToBook).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) ? (
        <>
          <CtaButton text='Cancel' color='cta-red' onClick={handleCancelClick} />
          <ConfirmModal
            title='Are you sure you want to be removed from the waiting list?'
            isOpen={isModalVisible}
            childElement={bookingInfoElement()}
            showConfirmButton
            confirmButtonLabel={isModalLoading ? "Cancelling place on list" : "Yes. Cancel it"}
            confirmButtonColor='cta-red'
            confirmButtonDisabled={isModalLoading}
            confirmButtonLoading={isModalLoading}
            onConfirm={handleCancelConfirm}
            cancelButtonLabel='No. Keep it'
            cancelButtonColor='cta-green'
            cancelButtonDisabled={isModalLoading}
            onCancel={handleCloseModal}
          />
          <h2>Useful information</h2>

          <h3>Waiting list</h3>
          <p>
            You have been added to the waiting list for this area. If a space becomes available, you will be automatically booked into the
            first available slot in the area.
          </p>

          <h3>About {data!.location.name}</h3>
          <p>
            You can find directions, details of facilities and useful links for {data!.location.name} on the{" "}
            <Link to={`/location/${data!.location.id}`}>location details page</Link>.
          </p>

          <h3>Slack confirmation</h3>
          <p>
            If your automatic booking happens before the day, you will receive a message on Slack on the booking date, asking you to
            confirm whether you would like to keep this booking. If you have not confirmed the booking by {BookingWaitListDequeueTime.friendlyTime} then it will be
            automatically cancelled. We do this so that spaces can be booked by other Hippos if you're no longer able to make your
            booking.
            <br /> <br />
            If your automatic booking happens on the day, you will not need to do anything.
            <br /> <br />
            In both cases you can cancel the booking through the slack message if you decide you do not need it.
          </p>
        </>
      ) : (
        <p>You cannot cancel this booking as it is in the past.</p>
      )}
    </div>
  );
};

export default WaitingListBookingDetail;
