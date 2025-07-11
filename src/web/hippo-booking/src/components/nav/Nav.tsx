import { Link } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "./Nav.scss";
import HippoReserveLogo from "../../assets/hippo-reserve-logo.svg";
import { useUser } from "../../contexts/UserContext";
import { signUserOut } from "../../services/Apis";
import { useState } from "react";

const Nav = () => {
  const userContext = useUser();

  async function handleSignOut() {
    try {
      await signUserOut();
      userContext.clearUser();
      googleLogout();
    } catch (err) {
      console.error("error signing user out", err);
    }
  }
  const [showMobileMenu, setMobileShowMenu] = useState(false);

  const toggleMobileMenu = () => {
    setMobileShowMenu(!showMobileMenu);
  };

  const closeMenuOnMobile = () => {
    if (window.innerWidth <= 1000) {
      setMobileShowMenu(false);
    }
  };

  return (
    <header>
      <div className='nav-container'>
        <Link aria-label='home page' to='/' onClick={closeMenuOnMobile} className='nav-site-logo'>
          <img alt='' src={HippoReserveLogo}></img>
          <span>Hippo Reserve</span>
        </Link>
        <div>
          <button
            className={showMobileMenu ? "hamburger active" : "hamburger"}
            id='mobile-menu-toggle'
            aria-label='toggle mobile menu'
            onClick={toggleMobileMenu}
          >
            <span className='bar'></span>
            <span className='bar'></span>
            <span className='bar'></span>
          </button>
          <nav id='main-navigation' aria-label='primary'>
            <ul className={showMobileMenu ? "nav-menu active" : "nav-menu"}>
              <li>
                <Link to='/locations' onClick={closeMenuOnMobile}>
                  Make a new booking
                </Link>
              </li>
              <li>
                <Link to='/bookings' onClick={closeMenuOnMobile}>
                  My bookings
                </Link>
              </li>
              {userContext.user?.isAdmin ? (
                <li>
                  <Link to='/admin' onClick={closeMenuOnMobile}>
                    Admin
                  </Link>
                </li>
              ) : null}

              <li>
                {userContext.user ? (
                  <button type='button' onClick={handleSignOut} className='cta cta-green' id='sign-out-btn'>
                    Sign out
                  </button>
                ) : null}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Nav;
