import { Link } from "react-router-dom";
import "./ActionTile.scss"

type LinkDisplayProps = 
    | { show: true, text: string, to: string}
    | { show: false | undefined | null}

type ActionTileProps = {
    title : string;
    primaryLink: LinkDisplayProps;
    secondaryLink: LinkDisplayProps;
};

const ActionTile = ({title, primaryLink, secondaryLink} : ActionTileProps) => {
    return (
        <div className="action-tile">
            <h2>{title}</h2>
            {secondaryLink.show ? (
                <Link to={secondaryLink.to} className="secondary-link">{secondaryLink.text}</Link>
            ) : null}
            {primaryLink.show ? (
                <Link to={primaryLink.to} className="cta cta-green with-arrow">{primaryLink.text}</Link>
            ) : null}
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