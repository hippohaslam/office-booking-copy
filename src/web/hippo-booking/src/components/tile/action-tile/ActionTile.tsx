import "./ActionTile.scss";
import { Link } from "react-router-dom";
import type { JSX } from "react";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import CtaLink from "../../links/cta/CtaLink";

type LinkDisplayProps = { show: true; text: string; to: string } | { show: false | undefined | null };

type ActionTileProps = {
  title: string;
  description?: string;
  iconSrc?: string;
  primaryLink: LinkDisplayProps;
  secondaryLink: LinkDisplayProps;
  tileTestId?: string;
};

const ActionTile = ({ title, iconSrc, description, primaryLink, secondaryLink, tileTestId }: ActionTileProps) => {
  return (
    <div className='action-tile' data-testid={isNullOrEmpty(tileTestId) ? "action-tile" : tileTestId}>
      <div className='tile-content'>
        {!isNullOrEmpty(iconSrc) ? <img src={iconSrc} alt='' /> : null}
        <div>
          <h2>{title}</h2>
          {!isNullOrEmpty(description) ? <p className='tile-description'>{description}</p> : null}
          {secondaryLink.show ? (
            <Link to={secondaryLink.to} className='secondary-link'>
              {secondaryLink.text}
            </Link>
          ) : null}
        </div>
      </div>
      {primaryLink.show ? (
        <div>
          <br />
          <CtaLink text={primaryLink.text} to={primaryLink.to} color='cta-green' withArrow={true} />
        </div>
      ) : null}
    </div>
  );
};

type ActionTileListProps = {
  listItems: JSX.Element[];
};

const ActionTileList = ({ listItems }: ActionTileListProps) => {
  return (
    <div className='action-title__list-container'>
      <ul className='action-tile__list'>
        {listItems.map((listItem, index) => (
          <li key={index}>{listItem}</li>
        ))}
      </ul>
    </div>
  );
};

export { ActionTile, ActionTileList };
