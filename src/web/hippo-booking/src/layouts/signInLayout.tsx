import React from 'react';
const MainLayout = ({children}: {children: React.ReactElement}) => {
    return (
        <main>
            {children}
        </main>
    );
};
export default MainLayout;