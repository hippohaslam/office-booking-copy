import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./BookingConfirmed.scss";
import Graphic from "../../../assets/big-tick-icon.svg";
import BookingCardStacked from "../../../components/booking/BookingCardStacked";
import { ErrorBanner, ConfirmationInformation } from "../../../components";
import { getBookingAsync } from "../../../services/Apis";
import { useQuery } from "@tanstack/react-query";

const BookingConfirmed = () => {
  const { bookingId } = useParams();

  const { isFetching, error, data } = useQuery({
    queryKey: ["booking"],
    queryFn: () => getBookingAsync(Number(bookingId)),
  });

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

  return (
    <div>
      <Helmet>
        <title>{"Booking confirmed | Hippo Reserve"}</title>
      </Helmet>
      <Link to='/'>Back to home page</Link>
      <div className='confirmed-page-heading'>
        <img alt='' className='confirmed-page-tick-graphic' src={Graphic}></img>
        <h1>Booking confirmed</h1>
      </div>
      {data && (
        <div>
          <h2>Your booking details:</h2>
          <BookingCardStacked
            date={data.date}
            bookableObjectName={data?.bookableObject.name}
            areaName={data.area.name}
            locationName={data.location.name}
            color='hippo-brand-bluey-grey'
          />
          <p>You will receive a Slack message confirming this booking.</p>
        </div>
      )}

      {data && <ConfirmationInformation locationData={data.location} />}

      <br />
    </div>
  );
};

export default BookingConfirmed;
