import Banner from "./Banner";
import WarningIcon from "../../assets/warning-icon.svg"
import "./Banners.scss";

type bannerProps = {
    isShown: boolean;
    title: string;
    description?: string;
  };
  
  const WarningBanner = ({isShown, title, description} : bannerProps) => {
  
    const descriptionElement = <p className="alert-description">{description}</p>;
  
    return (
      <Banner isShown={isShown} title={title} descriptionElement={descriptionElement} iconSrc={WarningIcon} containerClass="warning-banner" allowClose={true}/>
    )
  };
  
  export default WarningBanner;