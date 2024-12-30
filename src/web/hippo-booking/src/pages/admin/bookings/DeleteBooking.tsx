import { useLocation, useNavigate } from "react-router-dom";
import { CtaButton } from "../../../components";
import { useMutation } from "@tanstack/react-query";
import { deleteBookingByAdminAsync } from "../../../services/Apis";

const EditBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, bookingQuery } = location.state || {};
  const handleDeleteBooking = useMutation({
    mutationFn: () => deleteBookingByAdminAsync(booking.id),
    onSuccess: () => {
      handleBack({ deleted: true });
    },
  });

  if (!booking) {
    return <div>No booking details available.</div>;
  }

  const handleBack = (additionalState = {}) => {
    navigate("/admin/bookings", { state: { bookingQuery, ...additionalState } });
  };

  return (
    <div>
      <h1>Delete booking</h1>
      <p>Booking ID: {booking.id}</p>
      <p>Date: {booking.date.toString()}</p>
      <p>Booked by: {booking.bookedBy}</p>
      <p>Booking name: {booking.bookableObject.name}</p>
      <div className=''>
        <CtaButton text='Confirm delete' type='button' color='cta-green' onClick={() => handleDeleteBooking.mutate()}></CtaButton>
        <CtaButton text='Cancel' type='button' color='cta-red' onClick={() => handleBack()} />
      </div>
    </div>
  );
};

export default EditBooking;
