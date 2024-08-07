import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ErrorBanner, SuccessBanner } from "../../components/index.ts";
import BookingTable from "../../components/table/bookings/BookingTable.tsx";
import BookingCardStacked from "../../components/booking/BookingCardStacked.tsx";
import { deleteBookingAsync, getUpcomingBookingsAsync } from "../../services/Apis.ts";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal.tsx";

const Bookings = () => {
    const queryClient = useQueryClient();

    const { isFetching, data, isError } = useQuery({
        queryKey: ["bookings"],
        queryFn: getUpcomingBookingsAsync,
    });

    const groupBookingsByDate = (bookings: Booking[] | undefined): { [key: string]: Booking[]} => {
        if (!bookings){
            return {};
        }
        return bookings?.reduce((grouped, booking) => {
            const dateKey =  new Date(booking.date).toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(booking);
            return grouped;
        }, {} as { [key: string]: Booking[]});
    };

    const groupedBookings = groupBookingsByDate(data);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showSuccessBanner, setSuccessBannerVisibility] = useState(false);

    const deleteBooking = useMutation({
        mutationFn: async (booking : Booking) => {
            if (booking) {
                await deleteBookingAsync(booking.location.id, booking.area.id, booking.bookingId);
            } else {
                throw new Error('No booking selected');
            }
        },
        onSuccess: async () => { 
            await handleDeleteSuccess();
        }
    })

    const handleDeleteSuccess = async () => {
        setSuccessBannerVisibility(true);
        await queryClient.invalidateQueries({queryKey: ["bookings"]});
    };

    const handleCancelClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalVisible(true);
    }

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedBooking(null);
    }

    const handleConfirmCancel = () => {
        if (selectedBooking) {
            deleteBooking.mutate(selectedBooking);
            handleCloseModal();
        } else {
            console.error('No booking selected for cancellation');
        }
    };

    const bookingInfoElement = () => {
        if (selectedBooking) {
            return (
                <BookingCardStacked 
                elementId="cancel-modal-booking-info" 
                date={selectedBooking.date} 
                bookableObjectName={selectedBooking.bookableObject.name} 
                areaName={selectedBooking.area.name} 
                locationName={selectedBooking.location.name}/>
            )
        }
        else {
            return (
                <span>Selected booking is null</span>
            )
        }
    }

    if (isError) {
        return <ErrorBanner text="Unable to get locations, please refresh the page" />;
    }

     if (isFetching) {
        return <div><span>Fetching locations...</span></div>
    }

    return (
        <div>
            {(showSuccessBanner) && 
            <SuccessBanner text="Booking cancelled"/>}
            <h1>My bookings</h1>
            <h2>Upcoming</h2>
            {data?.length === 0 && 
            <p>You have no upcoming bookings.</p>}
            {Object.keys(groupedBookings).map(date => (
                <div key={date}>
                    <BookingTable date={date} bookings={Object.values(groupedBookings[date])} onClick={handleCancelClick}/>
                </div>
            ))}
            <Link to="/locations" className="cta cta-green with-arrow">Make a new booking</Link>

            <ConfirmModal 
            isOpen={isModalVisible} 
            childElement={bookingInfoElement()}
            confirmButtonLabel="Yes. Cancel it"
            confirmButtonColor="cta-red"
            onConfirm={handleConfirmCancel}
            cancelButtonLabel="No. Keep it"
            cancelButtonColor="cta-green"
            onCancel={handleCloseModal}/>
        </div>
    )
}

export default Bookings;