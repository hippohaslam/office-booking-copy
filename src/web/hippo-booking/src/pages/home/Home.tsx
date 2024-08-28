import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext.tsx";
import RelaxingGraphic from "../../assets/undraw_a_moment_to_relax_re_v5gv.svg";
import OfficeGraphic from "../../assets/undraw_in_the_office_re_jtgc.svg";
import ErrorGraphic from "../../assets/undraw_not_found_re_bh2e.svg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingBookingsAsync } from "../../services/Apis.ts";
import { ErrorBanner } from "../../components/banners/ErrorBanner.tsx";
import BookingCardStacked from "../../components/booking/BookingCardStacked.tsx";
import { InformationBanner } from "../../components/index";

const Home = () => {
  const userContext = useUser();
  const [graphicSrc, setGraphicSrc] = useState(RelaxingGraphic);

  const { isFetching, data, isSuccess, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: getUpcomingBookingsAsync,
  });

  // Set the graphic based on the state of the query
  useEffect(() => {
    if (isFetching) {
      setGraphicSrc(RelaxingGraphic);
    } else if (isError) {
      setGraphicSrc(ErrorGraphic);
    } else if (isSuccess && data?.length === 0) {
      setGraphicSrc(RelaxingGraphic);
    } else if (isSuccess) {
      setGraphicSrc(OfficeGraphic);
    }
  }, [data?.length, isFetching, isSuccess, isError]);

  // Just returns HTML based on the state of the query
  const cardToShow = () => {
    if (isFetching) {
      return <p>Fetching bookings...</p>;
    } else if (isError) {
      return <ErrorBanner isShown={true} title='Error' errorMessage='Unable to get bookings, please refresh the page' allowClose={false} />;
    } else if (isSuccess && data) {
      const nextBooking = data.at(0);
      if (data.length === 0 || !nextBooking) {
        return <p>You don't have any upcoming bookings.</p>;
      }

      return (
        <div>
          <p>You have an upcoming booking:</p>
          <BookingCardStacked
            date={nextBooking.date}
            bookableObjectName={nextBooking.bookableObject.name}
            areaName={nextBooking.area.name}
            locationName={nextBooking.location.name}
          />
          <Link className='with-arrow' to='/bookings'>
            Manage this and other bookings
          </Link>
        </div>
      );
    } else {
      // This should never happen
      return <p></p>;
    }
  };

  return (
    <div className='page-container'>
      <section className='full-width-navy'>
        <div className='hero-container'>
          <div className='hero-content hero-container__medium-height'>
            <h1>Hi {userContext.user?.firstName}</h1>
            {isSuccess ? <div>{cardToShow()}</div> : null}
            <Link to='/locations' className='cta cta-pink with-arrow'>
              Make a new booking
            </Link>
          </div>
          <img className='hero-graphic' alt='' src={graphicSrc} />
        </div>
      </section>
      <section className='text-content-container'>
        <InformationBanner
          title='Information'
          isShown
          description='This site is currently in Development and liable to changes in features and data.'
          allowClose={false}
        />
        <h3>About</h3>
        <p>You can book a desk or parking space, view your bookings, and cancel bookings.</p>
      </section>
    </div>
  );
};

export default Home;
