import { Link, useParams } from "react-router-dom";
import "./BookingConfirmed.scss";
import Graphic from "../../../assets/big-tick-icon.svg";
import BookingCardStacked from "../../../components/booking/BookingCardStacked";
import SlackIcon from "../../../assets/slack-icon.svg";
import GuideIcon from "../../../assets/guide-icon.svg";
import HelpIcon from "../../../assets/help-icon.svg";
import { CtaLink, ErrorBanner, InfoTile, InfoTileList } from "../../../components";
import { getBookingAsync } from "../../../services/Apis";
import { useQuery } from "@tanstack/react-query";
import { Area } from "../../../interfaces/Area";

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
          <div className='sub-section-grey'>
            <h2>Need another booking in {data?.location.name}?</h2>
            <p>Bookings can be placed up to 6 weeks in advance. You can also book spaces for guests and other Hippos under your name.</p>
            <div className='button-group'>
              {data.location.areas.map((area: Area) => {
                return (
                  <CtaLink
                    key={area.id}
                    text={`Book ${area.name}`}
                    to={`/locations/${data?.location.id}/areas/${area.id}`}
                    color='cta-navy'
                    withArrow={true}
                  />
                );
              })}
            </div>
          </div>
          <CtaLink text='Manage this and other bookings' to='/bookings' color='cta-green' withArrow={true} />
        </div>
      )}

      <h2>Before your visit</h2>
      <InfoTileList>
        <InfoTile iconSrc={SlackIcon}>
          <h3>Join the office Slack channel</h3>
          <p>
            Keep up to date with the goings on at {data?.location.name} by joining the #office-{data?.location.name.toLowerCase()} channel
            on Slack. This will include information about support, socials, guests and more.
          </p>
          <Link to='' target='_blank'>
            View the #office-{data?.location.name.toLowerCase()} channel on Slack
          </Link>
        </InfoTile>
        <InfoTile iconSrc={GuideIcon}>
          <h3>Read the office guide</h3>
          <p>
            Almost all the information you need to know about access, facilities, refreshments, dogs and so on is available in the office
            guide. You can find this by going to the bookmarks in the office Slack channel or by searching for the office on Google Drive.
          </p>
          <Link to='' target='_blank'>
            View the #office-{data?.location.name.toLowerCase()} guide document in Google Drive
          </Link>
        </InfoTile>
        <InfoTile iconSrc={HelpIcon}>
          <h3>Need some help?</h3>
          <p>
            Raise a request using Halp on Slack or post a message in the office Slack channel and someone from the facilities team will get
            back to you asap.
          </p>

          <Link to='https://hippo-digital.slack.com/archives/D04RAG3U3SR' target='_blank'>
            Raise a Halp request on Slack
          </Link>
        </InfoTile>
      </InfoTileList>
      <br />
    </div>
  );
};

export default BookingConfirmed;
