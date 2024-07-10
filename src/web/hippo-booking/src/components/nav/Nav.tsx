import {Link} from 'react-router-dom'
import { googleLogout } from '@react-oauth/google';
import './Nav.scss'
import HippoSvg from '../../assets/hippo-navy.svg'
import HippoIconSvg from '../../assets/hippo-icon.svg'
import { useUser } from '../../contexts/UserContext';
import { signUserOut } from '../../services/Apis';
import {useState} from "react";

const Nav = () => {
  const userContext = useUser();

  async function handleSignOut() {
    try {
      await signUserOut();
      userContext.clearUser();
      googleLogout();
    } catch(err) {
      console.error('error signing user out', err);
    }
  }
    const [showMobileMenu, setMobileShowMenu] = useState(false);

    const toggleMobileMenu = () => {
        setMobileShowMenu(!showMobileMenu);
    };

    const closeMenuOnMobile = () => {
        if (window.innerWidth <= 768) {
            setMobileShowMenu(false);
        }
    };

    return (
       <header>
           <div className="nav-container">
               <Link className="nav-container-logo" to="/" onClick={closeMenuOnMobile}>
                   <img src={window.innerWidth <= 500 ? HippoIconSvg : HippoSvg} alt="Hippo Logo"/>
               </Link>
               <Link className="nav-container-logo" to="/" onClick={closeMenuOnMobile}>
                   Office Bookings
               </Link>
               <div>
                   <button className={showMobileMenu ? "hamburger active" : "hamburger"} id="mobile-menu-toggle"
                           aria-label="toggle mobile menu" onClick={toggleMobileMenu}>
                       <span className="bar"></span>
                       <span className="bar"></span>
                       <span className="bar"></span>
                   </button>
                   <nav id="main-navigation" aria-label="primary">
                       <ul className={showMobileMenu ? "nav-menu active" : "nav-menu"}>
                           <li>
                               <Link to="/locations" onClick={closeMenuOnMobile}>Booking</Link>
                           </li>
                           <li>
                               <Link to="/admin" onClick={closeMenuOnMobile}>Admin</Link>
                           </li>
                           <li>
                               {userContext.user
                                   ?
                                   <button type="button" onClick={handleSignOut} className="primary-cta"
                                           id="sign-out-btn">
                                       Sign out
                                   </button>
                                   : null}

                           </li>
                       </ul>
                   </nav>
               </div>

           </div>
       </header>
    )
}

export default Nav;