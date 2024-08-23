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
        <h2>Our offices</h2>
        <p>Some content about our offices will go in here.</p>
        <h3>Some more content</h3>
        <p>
          Filling this page with more content to force the height to go beyond 100vh on mobile devices. Filling this page with more content
          to force the height to go beyond 100vh on mobile devices. Filling this page with more content to force the height to go beyond
          100vh on mobile devices. Filling this page with more content to force the height to go beyond 100vh on mobile devices. Filling
          this page with more content to force the height to go beyond 100vh on mobile devices .Filling this page with more content to force
          the height to go beyond 100vh on mobile devices
        </p>
        <h4>Why</h4>
        <p>Because safari on mobile doesn't respect 100vh with it's fancy floating search bar</p>
      </section>
    </div>
  );
};

export default Home;
