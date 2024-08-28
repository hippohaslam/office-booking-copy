import Banner from "./Banner";
import InfoIcon from "../../assets/info-icon.svg";
import "./Banners.scss";

type bannerProps = {
  isShown: boolean;
  title: string;
  description?: string;
  allowClose?: boolean;
};

const InformationBanner = ({ isShown, title, description, allowClose = true }: bannerProps) => {
  return (
    <Banner
      isShown={isShown}
      title={title}
      descriptionElement={<p className='alert-description'>{description}</p>}
      iconSrc={InfoIcon}
      containerClass='information-banner'
      allowClose={allowClose}
    />
  );
};

export default InformationBanner;
