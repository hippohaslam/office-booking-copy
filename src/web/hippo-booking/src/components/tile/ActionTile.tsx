import { Link } from "react-router-dom";
import "./ActionTile.scss"

type ActionTileProps = {
    title : string;
    primaryLinkText: string;
    primaryLinkHref: string;
    secondaryLinkText: string;
    secondaryLinkHref: string;
};

const ActionTile = ({title, primaryLinkText, primaryLinkHref, secondaryLinkText, secondaryLinkHref} : ActionTileProps) => {
    return (
        <div className="action-tile">
            <h2>{title}</h2>
            <Link to={secondaryLinkHref} className="secondary-link">{secondaryLinkText}</Link>
            <Link to={primaryLinkHref} className="cta cta-green with-arrow">{primaryLinkText}</Link>
        </div>
    )
}

type ActionTileListProps = {
    listItems : JSX.Element[];
}

const ActionTileList = ({listItems} : ActionTileListProps) => {
    return (
        <div className="action-title__list-container">
            <ul className="action-tile__list">
                {listItems.map((listItem, index) => (
                    <li key={index}>
                        {listItem}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export {ActionTile, ActionTileList};