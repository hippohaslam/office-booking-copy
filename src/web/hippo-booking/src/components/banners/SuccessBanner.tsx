import "./Banners.scss";
import SuccessIcon from "../../assets/success-icon.svg";
import Banner from "./Banner";

type bannerProps = {
  isShown: boolean;
  title: string;
  description?: string;
};

const SuccessBanner = ({ isShown, title, description }: bannerProps) => {
  const descriptionElement = <p className='alert-description'>{description}</p>;

  return (
    <Banner
      isShown={isShown}
      title={title}
      descriptionElement={descriptionElement}
      iconSrc={SuccessIcon}
      containerClass='success-banner'
      allowClose={true}
    />
  );
};

export default SuccessBanner;
