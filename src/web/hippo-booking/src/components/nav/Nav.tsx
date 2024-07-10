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
       <div className="nav-container">
         <div className="nav-container-logo">
          <Link to="">
          <img src={HippoSvg} alt="Hippo Logo" />
          </Link>
         </div>
         <nav>
        <ul>
          <li>
            <Link to="/locations">Booking</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
          <li>
           {userContext.user 
           ? <button type="button" onClick={handleSignOut}>Sign out</button>
          : null}
            
          </li>
        </ul>
      </nav>
       </div>
    )
}

export default Nav;