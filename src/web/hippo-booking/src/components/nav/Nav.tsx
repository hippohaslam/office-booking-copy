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
            <Link to="desk">Desks</Link>
          </li>
          <li>
            <Link to="parking">Parking</Link>
          </li>
          {/* <li>
            <Link to="floorplan">floorplan</Link>
          </li> */}
        </ul>
      </nav>
       </div>
    )
}

export default Nav;