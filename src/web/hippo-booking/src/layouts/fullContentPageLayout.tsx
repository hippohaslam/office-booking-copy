import Nav from "../components/nav/Nav.tsx";
import Footer from "../components/footer/Footer.tsx";
import { Outlet } from "react-router-dom";
const BaseLayout = () => {
  return (
    <div>
      <Nav />
      <main>
        <section className='full-width-standard-grey content-container'>
          <Outlet />
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default BaseLayout;
