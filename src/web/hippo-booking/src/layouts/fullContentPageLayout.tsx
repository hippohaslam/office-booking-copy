import Nav from "../components/nav/Nav.tsx";
import Footer from "../components/footer/Footer.tsx";
import { Outlet } from "react-router-dom";
import { SkipToContentLink } from "../components";
import { useRef } from "react";

const BaseLayout = () => {
  const mainContentRef = useRef<HTMLElement>(null);

  return (
    <div>
      <SkipToContentLink skipToElementRef={mainContentRef}/>
      <Nav />
      <main ref={mainContentRef} id='main-content'>
        <section className='full-width-standard-grey content-container'>
          <Outlet />
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default BaseLayout;
