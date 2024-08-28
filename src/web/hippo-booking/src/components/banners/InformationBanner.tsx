import Banner from "./Banner";
import WarningIcon from "../../assets/warning-icon.svg";
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
      iconSrc={WarningIcon}
      containerClass='information-banner'
      allowClose={allowClose}
    />
  );
};

export default InformationBanner;
