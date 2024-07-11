import React from 'react';
import Nav from "../components/nav/Nav.tsx";
import Footer from "../components/footer/Footer.tsx";
const BaseLayout = ({children}: {children: React.ReactElement}) => {
    return (
        <div>
            <Nav />
            <main>
                <div className="page-container">
                    <section className="full-width-standard-grey">
                        {children}
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
};
export default BaseLayout;