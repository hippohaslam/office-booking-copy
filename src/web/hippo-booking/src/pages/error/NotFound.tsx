import { Helmet } from "react-helmet";

const NotFoundPage = () => {
  return (
    <div>
      <Helmet>
        <title>Error - page not found | Hippo Reserve</title>
      </Helmet>
      <h1>404 Not Found</h1>
      <p>Sorry, this is not the page you are looking for...</p>
    </div>
  );
};

export default NotFoundPage;
