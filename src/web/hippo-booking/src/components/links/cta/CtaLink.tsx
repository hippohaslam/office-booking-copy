import { Link } from "react-router-dom";
import "./CtaLink.scss";

type CtaLinkProps = {
    text: string;
    to : string;
    color: "cta-green" | "cta-pink" | "cta-navy" | "cta-yellow" | "cta-red";
    withArrow?: boolean;
};

const CtaLink = ({text, to, color, withArrow = false} : CtaLinkProps) => {
    return (
        <Link to={to} className={"cta " + color + (withArrow ? " with-arrow" : "")}>{text}</Link>
    )
};

export default CtaLink;