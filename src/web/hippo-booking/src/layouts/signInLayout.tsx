import {Outlet} from "react-router-dom";
const MainLayout = () => {
    return (
        <main>
            <div className="login-page-container login-container">
                <Outlet />
            </div>
        </main>
    );
};
export default MainLayout;