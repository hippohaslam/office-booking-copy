import "./InfoTile.scss";

type InfoTileListProps = {
    children: JSX.Element[];
}

const InfoTileList : React.FC<InfoTileListProps> = ({children} : InfoTileListProps) => {
    return (
        <ul className="info-tile-list">
            {children.map((listItem, index) => (
                <li className="info-tile-list-item" key={index}>
                    {listItem}
                </li>
            ))}
        </ul>
    )
}

export default InfoTileList;