import { Link } from "react-router-dom";
import "./IconButton.scss";

type IconLinkProps = {
    color: 'navy' | 'grey';
    iconSrc: string;
    title: string;
    to: string;
    showBorder: boolean;
    showText: boolean;
};

const IconLink = ({iconSrc, title, to, color, showBorder, showText} : IconLinkProps) => {
    return (
        <Link className={'icon-link icon-link__' + color + (showBorder == true ? ' icon-link__border': '')} title={title} aria-label={title} to={to}>
            <img alt="" src={iconSrc}/>
            {showText && <span>{title}</span>}
        </Link>
    )
};

export default IconLink;