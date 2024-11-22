import Nav from "../components/nav/Nav.tsx";
import Footer from "../components/footer/Footer.tsx";
import { Outlet } from "react-router-dom";
import { useRef } from "react";
import { SkipToContentLink } from "../components";

const BaseLayout = () => {
  const mainContentRef = useRef<HTMLElement>(null);

  return (
    <div>
      <SkipToContentLink skipToElementRef={mainContentRef}/>
      <Nav />
      <main ref={mainContentRef} id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default BaseLayout;