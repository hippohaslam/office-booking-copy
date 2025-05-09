import Banner from "./Banner";
import InfoIcon from "../../assets/info-icon.svg";
import "./Banners.scss";
import {JSX} from "react";

type bannerProps = {
  isShown: boolean;
  title: string;
  description?: string;
  allowClose?: boolean;
  cta?: JSX.Element;
};

const InformationBanner = ({ isShown, title, description, allowClose = true, cta = undefined}: bannerProps) => {
  return (
    <Banner
      isShown={isShown}
      title={title}
      descriptionElement={<p className='alert-description'>{description}</p>}
      iconSrc={InfoIcon}
      containerClass='information-banner'
      allowClose={allowClose}
      cta={cta}
    />
  );
};

export default InformationBanner;
