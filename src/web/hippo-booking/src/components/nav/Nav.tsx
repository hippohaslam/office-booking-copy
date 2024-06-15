import {Link} from 'react-router-dom'
import './Nav.scss'
import HippoSvg from '../../assets/hippo.svg'

const Nav = () => {
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
            <Link to="locations">Booking</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
       </div>
    )
}

export default Nav;