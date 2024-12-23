import "./InfoTile.scss";
import type { JSX } from "react";

type InfoTileListProps = {
  children: JSX.Element[];
  singleColumn?: boolean;
};

const InfoTileList: React.FC<InfoTileListProps> = ({ children, singleColumn = false }: InfoTileListProps) => {
  return (
    <ul className={singleColumn ? "info-tile-list single-column" : "info-tile-list"}>
      {children.map((listItem, index) => (
        <li className='info-tile-list-item' key={index}>
          {listItem}
        </li>
      ))}
    </ul>
  );
};

export default InfoTileList;
