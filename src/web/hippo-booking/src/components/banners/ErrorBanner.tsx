import Banner from "./Banner";
import ErrorIcon from "../../assets/error-icon.svg";

type ErrorBannerSingleProps = {
  isShown: boolean;
  title: string;
  errorMessage: string;
  allowClose: boolean;
};

type ErrorBannerMultipleProps = {
  isShown: boolean;
  title: string;
  errors: ErrorObjects[];
  allowClose: boolean;
};

const ErrorBanner = ({isShown, title, errorMessage, allowClose} : ErrorBannerSingleProps) => {
  const descriptionElement = (<p className="alert-description">{errorMessage}</p>);

  return (
    <Banner isShown={isShown} containerClass={"error-banner"} title={title} descriptionElement={descriptionElement} iconSrc={ErrorIcon} allowClose={allowClose} />
  );
}

const MultiErrorBanner = ({isShown, title, errors, allowClose} : ErrorBannerMultipleProps) => {
  const descriptionElement = (
    <ul>
    {errors.map((error) => {
      return <li>{error.message}</li>
    } )}
    </ul>
  );

  return (
    <Banner isShown={isShown} containerClass={"error-banner"} title={title} descriptionElement={descriptionElement} iconSrc={ErrorIcon} allowClose={allowClose} />
  );
}

export {ErrorBanner, MultiErrorBanner};