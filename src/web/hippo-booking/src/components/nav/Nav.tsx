import {Link} from 'react-router-dom'
import { googleLogout } from '@react-oauth/google';
import './Nav.scss'
import HippoSvg from '../../assets/hippo.svg'
import { useUser } from '../../contexts/UserContext';
import { signUserOut } from '../../services/Apis';

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



    return (
       <header>
           <div className="nav-container">
               <Link className="nav-container-logo" to="">
                   <img src={HippoSvg} alt="Hippo Logo"/>
                   Hippo Bookings
               </Link>
               <nav id="main-navigation" aria-label="primary">
                   <ul>
                       <li>
                           <Link to="/locations">Booking</Link>
                       </li>
                       <li>
                           <Link to="/admin">Admin</Link>
                       </li>
                       <li>
                           {userContext.user
                               ? <button type="button" onClick={handleSignOut} className="primary-cta">Sign out</button>
                               : null}

                       </li>
                   </ul>
               </nav>
           </div>
       </header>
    )
}

export default Nav;