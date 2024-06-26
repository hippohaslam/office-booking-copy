import {Link} from 'react-router-dom'
import './Nav.scss'
import HippoSvg from '../../assets/hippo.svg'
import { useUser } from '../../contexts/UserContext';

const Nav = () => {
  const userContext = useUser();

  function handleSignOut() {
    console.log('Sign out clicked');
    userContext.setUser(null);
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