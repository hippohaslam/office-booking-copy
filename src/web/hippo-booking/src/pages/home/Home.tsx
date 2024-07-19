import { useUser } from "../../contexts/UserContext.tsx";
import RelaxingGraphic from '../../assets/undraw_a_moment_to_relax_re_v5gv.svg';
import OfficeGraphic from '../../assets/undraw_in_the_office_re_jtgc.svg'
import ErrorGraphic from '../../assets/undraw_not_found_re_bh2e.svg'
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingBookingsAsync } from "../../services/Apis.ts";
import ErrorBanner from "../../components/banners/ErrorBanner.tsx";
import BookingCardStacked from "../../components/booking/BookingCardStacked.tsx";

const Home = () => {
    const userContext = useUser();

    const { isFetching, error, data } = useQuery({
        queryKey: ["bookings"],
        queryFn: getUpcomingBookingsAsync,
    });

    const nextBooking = data?.at(0);
    let card;
    let graphicSrc;

    if (isFetching) {
        graphicSrc = RelaxingGraphic;
        card = <div><p>Fetching bookings...</p></div>;
    }
    if (error) {
        graphicSrc = ErrorGraphic;
        card = <div><ErrorBanner text="Unable to get bookings, please refresh the page" /></div>;
    }
    if (data?.length === 0) {
        graphicSrc = RelaxingGraphic;
        card = <div><p>You don't have any upcoming bookings.</p></div>;
    }
    else { 
        graphicSrc = OfficeGraphic;
        card = 
            <div>
                <p>You have an upcoming booking:</p>
                <BookingCardStacked                 
                    date={nextBooking?.date as Date}
                    bookableObjectName={nextBooking?.bookableObject.name as string}
                    areaName={nextBooking?.area.name as string}
                    locationName={nextBooking?.location.name as string}
                    />
                <Link className='with-arrow' to="/locations">Manage this and other bookings</Link>
            </div>;
    }

    return (
        <div className="page-container">
            <section className="full-width-navy">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>Hi {userContext.user?.firstName}</h1>
                        {card}
                        <Link to="/locations" className="cta cta-pink with-arrow">Make a new booking</Link>
                    </div>
                    <img className="hero-graphic" alt="" src={graphicSrc}/>
                </div>
            </section>
            <section className="full-width-grey">
                <div className="content-container">
                    <h2>Our offices</h2>
                    <p>Some content about our offices will go in here.</p>
                    <h3>Some more content</h3>
                    <p>Filling this page with more content to force the height to go beyond 100vh on mobile devices</p>
                    <h4>Why</h4>
                    <p>Because safari on mobile doesn't respect 100vh with it's fancy floating search bar</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
