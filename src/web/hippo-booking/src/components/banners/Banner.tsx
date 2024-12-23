import { useEffect, useRef, useState, type JSX } from "react";

type bannerProps = {
  isShown: boolean;
  containerClass: "success-banner" | "error-banner" | "warning-banner" | "information-banner";
  title: string;
  descriptionElement?: JSX.Element;
  iconSrc: string;
  allowClose: boolean;
};

// TODO: Add a close button to the banner so the parent manages the shown state instead of the banner itself

const Banner = ({ isShown, title, descriptionElement, iconSrc, containerClass, allowClose }: bannerProps) => {
  const [isBannerShown, setIsBannerShown] = useState(isShown);
  const bannerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsBannerShown(false);
  };

  useEffect(() => {
    setIsBannerShown(isShown);
  }, [isShown]);

  if (!isBannerShown) return null;
  return (
    <div role='alert' className={"alert-banner " + containerClass} ref={bannerRef}>
      <img src={iconSrc} alt='' />
      <div className='alert-content'>
        <strong className='alert-title'>{title}</strong>
        {descriptionElement}
      </div>
      {allowClose && (
        <button onClick={handleClose} className='banner-close-button' title='Close banner' aria-label='close banner'>
          <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#000000'>
            <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Banner;
