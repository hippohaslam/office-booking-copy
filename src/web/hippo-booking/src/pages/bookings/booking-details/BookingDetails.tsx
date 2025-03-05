import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteBookingAsync, getBookingAsync } from "../../../services/Apis";
import { ConfirmModal, CtaButton, ErrorBanner, Table, BookingCardStacked } from "../../../components";

const BookingDetails = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [ cancelError, setCancelError] = useState<Error | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalLoading, setModalLoading] = useState(false);

    const { isFetching, error, data } = useQuery({
        queryKey: ["booking"],
        queryFn: () => getBookingAsync(Number(bookingId)),
    });

    const cancelBooking = useMutation({
        mutationFn: async (bookingId: number) => {
            await deleteBookingAsync(bookingId);
        },
        onSuccess: async () => {
            navigate(`/bookings`, {state:{cancelledBooking: data}});
        },
        onError: (error) => {
            setCancelError(error);
        }
    });

    const handleCancelConfirm = () => {
        if (bookingId) {
            setModalLoading(true);
            cancelBooking.mutate(parseInt(bookingId));
        } else {
            console.log("Error with booking id");
        };
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
                        date={data.date}
                        bookableObjectName={data.bookableObject.name}
                        areaName={data.area.name}
                        locationName={data.location.name}
                    />
                </div>
            );
        } else {
            return <span>Booking data is null</span>;
        }
    };
    
    if (error) {
        return (
            <div className='content-container'>
            <ErrorBanner
                allowClose={false}
                isShown={true}
                title='Something went wrong'
                errorMessage={"There was an error retrieving the data: " + error.message}
            />
            </div>
        );
    }

    if (isFetching) {
        return (
            <div className='content-container'>
            <span>Fetching booking...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div>
                <ErrorBanner
                    allowClose={false}
                    isShown={true}
                    title='Something went wrong'
                    errorMessage={"There was an error retrieving the data"}
                />
            </div>
        );
    }
    else {
        const formattedDateTime = new Date(data?.date!).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

        return (
            <div>
                <title>Booking details | Hippo Reserve</title>
                <Link to='/bookings'>Back to my bookings</Link>
                {cancelError !== null ? (
                    <ErrorBanner isShown={true} title={"Error deleting this booking"} errorMessage={cancelError.message} allowClose={true} />
                ) : null}
                <br/>
                <h1>Booking details</h1>

                <Table title={"Details"} columnHeadings={["Detail", "Value"]} 
                    rows={
                        <>
                            <tr>
                                <td>Date</td>
                                <td>{formattedDateTime}</td>
                            </tr>
                            <tr>
                                <td>Bookable object</td>
                                <td>{data?.bookableObject.name}</td>
                            </tr>
                            <tr>
                                <td>Area</td>
                                <td>{data?.area.name}</td>
                            </tr>
                            <tr>
                                <td>Location</td>
                                <td>{data?.location.name}</td>
                            </tr>
                        </>
                    } 
                    headerVisuallyHidden/>
                { new Date(data.date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) ? (
                    <>
                        <CtaButton text="Cancel booking" color="cta-red" onClick={handleCancelClick}/>
                        <ConfirmModal
                            title='Are you sure you want to cancel this booking?'
                            isOpen={isModalVisible}
                            childElement={bookingInfoElement()}
                            showConfirmButton
                            confirmButtonLabel={isModalLoading ? "Cancelling booking" : "Yes. Cancel it"}
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

                        <h3>About {data?.location.name}</h3>
                        <p>You can find directions, details of facilities and useful links for {data?.location.name} on the <Link to={`/location/${data?.location.id}`}>location details page</Link>.</p>
            
                        <h3>Slack confirmation</h3>
                        <p>On the morning of your booking you will receive a message on Slack asking you to confirm whether you would like to keep this booking.</p>
                        <p>If you have not confirmed the booking by 10am then it will be automatically cancelled. We do this so that spaces can be booked by other Hippos if you're no longer able to make your booking.</p>
                    </>
                ) : <p>You cannot cancel this booking as it is in the past.</p>}
            </div>
        );
    }
};

export default BookingDetails;