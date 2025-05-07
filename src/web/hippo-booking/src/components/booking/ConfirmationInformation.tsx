import { Link } from "react-router-dom";
import { Area } from "../../interfaces/Area";
import { CtaLink, InfoTile, InfoTileList } from "../../components";
import SlackIcon from "../../assets/slack-icon.svg";
import GuideIcon from "../../assets/guide-icon.svg";
import HelpIcon from "../../assets/help-icon.svg";
import { BookingLocation } from "../../interfaces/Location";

const ConfirmationInformation = ({ locationData }: { locationData: BookingLocation }) => {
  return (
    <>
      <div className='sub-section-grey'>
        <h2>Need another booking in {locationData!.name}?</h2>
        <p>Bookings can be placed up to 6 weeks in advance. You can also book spaces for guests and other Hippos under your name.</p>
        <div className='cta-link-group'>
          {locationData?.areas?.map((area: Area) => {
            return (
              <CtaLink
                key={area.id}
                text={`Book ${area.name}`}
                to={`/locations/${locationData.id}/areas/${area.id}`}
                color='cta-navy'
                withArrow={true}
              />
            );
          })}
        </div>
      </div>
      <CtaLink text='Manage this and other bookings' to='/bookings' color='cta-green' withArrow={true} />

      <h2>Before your visit</h2>
      <InfoTileList>
        <InfoTile iconSrc={SlackIcon}>
          <h3>Join the office Slack channel</h3>
          <p>
            Keep up to date with the goings on at {locationData!.name} by joining the #office-{locationData!.name.toLowerCase()} channel on
            Slack. This will include information about support, socials, guests and more.
          </p>
          <Link to='' target='_blank'>
            View the #office-{locationData!.name.toLowerCase()} channel on Slack
          </Link>
        </InfoTile>
        <InfoTile iconSrc={GuideIcon}>
          <h3>Read the office guide</h3>
          <p>
            Almost all the information you need to know about access, facilities, refreshments, dogs and so on is available in the office
            guide. You can find this by going to the bookmarks in the office Slack channel or by searching for the office on Google Drive.
          </p>
          <Link to='' target='_blank'>
            View the #office-{locationData!.name.toLowerCase()} guide document in Google Drive
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
    </>
  );
};

export default ConfirmationInformation;
