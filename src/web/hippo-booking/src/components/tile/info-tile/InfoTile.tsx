import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import "./InfoTile.scss";

type InfoTileProps = {
  iconSrc?: string;
  color?: "info-tile-grey" | null;
  children: JSX.Element[];
};

const InfoTile: React.FC<InfoTileProps> = ({ iconSrc, children, color }: InfoTileProps) => {
  return (
    <div className={isNullOrEmpty(color) ? 'info-tile' : 'info-tile ' + color}>
      {!isNullOrEmpty(iconSrc) && <img alt='' src={iconSrc} />}
      <div>{children}</div>
    </div>
  );
};

export default InfoTile;