// TODO: Add styling

const ErrorBanner = ({text = "Error"}) => {
    return (
      <div>
        <h2>{text}</h2>
      </div>
    );
  };
  
  const SuccessBanner = ({text = "Success"}) => {
    return (
      <div>
        <h2>{text}</h2>
      </div>
    );
  }

  export { ErrorBanner, SuccessBanner };