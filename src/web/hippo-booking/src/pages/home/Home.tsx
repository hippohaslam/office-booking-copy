import { useUser } from "../../contexts/UserContext.tsx";
import RelaxingGraphic from '../../assets/undraw_a_moment_to_relax_re_v5gv.svg'
import {Link} from "react-router-dom";

const Home = () => {

    const userContext = useUser();

  return (
      <div className="page-container">
          <section className="full-width-darker-grey">
              <div className="hero-container">
                  <div className="hero-content">
                      <h1>Hi {userContext.user?.name}</h1>
                      <p>You don't have any upcoming bookings.</p>
                      <Link to="/locations" className="cta-link cta-link-green">Make a new booking</Link>
                  </div>
                  <img className="hero-graphic" alt="graphic of someone relaxing on a chair" src={RelaxingGraphic}/>
              </div>
          </section>
          <section className="full-width-standard-grey">
              <div className="content-container">
                  <h2>Our offices</h2>
                  <p>Some content about our offices will go in here.</p>
              </div>
          </section>
      </div>
  );
};

export default Home;
