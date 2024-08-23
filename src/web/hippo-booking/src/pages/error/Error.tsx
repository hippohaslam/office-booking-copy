import { useRouteError } from "react-router-dom";


export default function ErrorPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError();

  if(error && error.status === 404) {
    return (
      <div>
      <div id="error-page">
        <h1>{error.status}</h1>
        <p>Sorry, this is not the page you are looking for...</p>
      </div>
      </div>
    );
  } 

  return (
    <div>
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
    </div>
  );
}