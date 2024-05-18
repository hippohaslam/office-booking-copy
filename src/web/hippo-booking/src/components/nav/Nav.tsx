import './Nav.scss'
import HippoSvg from '../../assets/hippo.svg'

const Nav = () => {
    return (
       <div className="nav-container">
         <div className="nav-container-logo">
            <a href="/">
                <img src={HippoSvg} alt="Hippo Logo" />
            </a>
         </div>
         <nav>
        <ul>
          <li>
            <a href="/desk">Desks</a>
          </li>
          <li>
            <a href="/parking">Parking</a>
          </li>
        </ul>
      </nav>
       </div>
    )
}

export default Nav;