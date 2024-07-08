import "./CtaLink.scss"
import {Link} from "react-router-dom";

const CtaLink = (to: string) => {

    return (
        <Link to={to}/>
    )
}

export default CtaLink