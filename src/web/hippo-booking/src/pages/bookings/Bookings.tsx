import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CtaLink, ErrorBanner, SuccessBanner } from "../../components/index.ts";
import BookingTable from "../../components/table/bookings/BookingTable.tsx";
import BookingCardStacked from "../../components/booking/BookingCardStacked.tsx";
import { deleteBookingAsync, getUpcomingBookingsAsync } from "../../services/Apis.ts";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal.tsx";
import { AxiosError } from "axios";

const Bookings = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelledBooking, setCancelledBooking] = useState<Booking | null>(null);
  const [showSuccessBanner, setSuccessBannerVisibility] = useState(false);
  const [deleteError, setDeleteError] = useState<AxiosError | null>(null);
  const [isModalLoading, setModalLoading] = useState(false);

  const { isFetching, data, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: getUpcomingBookingsAsync,
  });

  const groupBookingsByDate = (bookings: Booking[] | undefined): { [key: string]: Booking[] } => {
    if (!bookings) {
      return {};
    }
    return bookings?.reduce(
      (grouped, booking) => {
        const dateKey = new Date(booking.date).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(booking);
        return grouped;
      },
      {} as { [key: string]: Booking[] },
    );
  };

  const groupedBookings = groupBookingsByDate(data);

  const deleteBooking = useMutation({
    mutationFn: async (booking: Booking) => {
      if (booking) {
        await deleteBookingAsync(booking.id);
      } else {
        throw new Error("No booking selected");
      }
    },
    onSuccess: async () => {
      await handleDeleteSuccess();
    },
    onError: (error) => {
      setDeleteError(error as AxiosError);
      handleCloseModal();
      setModalLoading(false);
    },
  });

  const handleDeleteSuccess = async () => {
    setSuccessBannerVisibility(true);
    setCancelledBooking(selectedBooking);
    handleCloseModal();
    setModalLoading(false);
    await queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBooking(null);
  };

  const handleConfirmCancel = () => {
    if (isModalLoading) {
      return;
    }
    if (selectedBooking) {
      setModalLoading(true);
      deleteBooking.mutate(selectedBooking);
    } else {
      console.error("No booking selected for cancellation");
    };
  };

  const bookingInfoElement = () => {
    if (selectedBooking) {
      return (
        <div>
          <BookingCardStacked
            elementId='cancel-modal-booking-info'
            date={selectedBooking.date}
            bookableObjectName={selectedBooking.bookableObject.name}
            areaName={selectedBooking.area.name}
            locationName={selectedBooking.location.name}
          />
        </div>
      );
    } else {
      return <span>Selected booking is null</span>;
    };
  };

  if (isError) {
    return (
      <ErrorBanner isShown={isError} title='Error' errorMessage='Unable to get locations, please refresh the page' allowClose={false} />
    );
  }

  if (isFetching) {
    return (
      <div>
        <span>Fetching locations...</span>
      </div>
    );
  }

  return (
    <div>
      <SuccessBanner
        isShown={showSuccessBanner}
        title='Booking cancelled'
        description={
          "Your booking of " +
          cancelledBooking?.bookableObject.name +
          " at " +
          cancelledBooking?.area.name +
          ", " +
          cancelledBooking?.location.name +
          " on " +
          new Date(cancelledBooking?.date || "").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }) +
          " has been cancelled."
        }
      />
      {deleteError !== null ? (
        <ErrorBanner isShown={true} title='There is a problem' errorMessage={deleteError.message} allowClose={false} />
      ) : null}

      <h1>My bookings</h1>
      <h2>Upcoming</h2>
      {data?.length === 0 && <p>You have no upcoming bookings.</p>}
      {Object.keys(groupedBookings).map((date) => (
        <div key={date}>
          <BookingTable date={date} bookings={Object.values(groupedBookings[date])} onClick={handleCancelClick} />
        </div>
      ))}
      <CtaLink to="/locations" color="cta-green" withArrow={true} text="Make a new booking"/>

      <ConfirmModal
        title='Are you sure you want to cancel this booking?'
        isOpen={isModalVisible}
        childElement={bookingInfoElement()}
        showConfirmButton
        confirmButtonLabel={isModalLoading ? "Cancelling booking" : 'Yes. Cancel it'}
        confirmButtonColor='cta-red'
        confirmButtonDisabled={isModalLoading}
        confirmButtonLoading={isModalLoading}
        onConfirm={handleConfirmCancel}
        cancelButtonLabel='No. Keep it'
        cancelButtonColor='cta-green'
        cancelButtonDisabled={isModalLoading}
        onCancel={handleCloseModal}
      />
    </div>
  );
};

export default Bookings;
