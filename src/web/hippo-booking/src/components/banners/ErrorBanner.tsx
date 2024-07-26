const ErrorBanner = ({text = "Error"}) => {
    return (
      <div>
        <h2>{text}</h2>
      </div>
    );
  };

const ErrorBannerMultiple = ({errors}: {errors: ErrorObjects[]}) => {
  return (
    <div>
      {errors.map((error) => {
        return <h2 key={error.key}>{error.message}</h2>
      } )}
    </div>
  );
}

export {ErrorBanner, ErrorBannerMultiple};
