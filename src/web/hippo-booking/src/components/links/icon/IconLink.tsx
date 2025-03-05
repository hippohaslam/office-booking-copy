import { Link } from "react-router-dom";
import "./IconLink.scss";

type IconLinkProps = {
    color: 'navy' | 'grey';
    iconSrc: string;
    label: string;
    title?: string;
    ariaLabel?: string;
    to: string;
    showBorder: boolean;
    showText: boolean;
    size?: 'small' | 'regular';
};

const IconLink = ({iconSrc, label, ariaLabel, title, to, color, showBorder, showText, size = 'regular'} : IconLinkProps) => {
    return (
        <Link className={'icon-link icon-link__' + color + (showBorder == true ? ' icon-link__border': '') + (size == 'small' ? ' icon-link__small' : '')} title={title} aria-label={ariaLabel != '' ? ariaLabel : title} to={to}>
            <img alt="" src={iconSrc}/>
            {showText && <span>{label}</span>}
        </Link>
    )
};

export default IconLink;