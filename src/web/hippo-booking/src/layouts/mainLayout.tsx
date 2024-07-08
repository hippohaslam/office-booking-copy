import React from 'react';
import Nav from "../components/nav/Nav.tsx";
import Footer from "../components/footer/Footer.tsx";
const MainLayout = ({children}: {children: React.ReactElement}) => {
    return (
        <div>
            <Nav />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};
export default MainLayout;