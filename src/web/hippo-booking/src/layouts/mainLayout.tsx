import React from 'react';
import Nav from "../components/nav/Nav.tsx";
const MainLayout = ({children}: {children: React.ReactElement}) => {
    return (
        <div>
            <Nav />
            <main>
                {children}
            </main>
            <footer>Test</footer>
        </div>
    );
};
export default MainLayout;