import "./InfoTile.scss";

type InfoTileProps = {
  iconSrc?: string;
  children: JSX.Element[];
};

const InfoTile: React.FC<InfoTileProps> = ({ iconSrc, children }: InfoTileProps) => {
  return (
    <div className='info-tile'>
      <img alt='' src={iconSrc} />
      <div>{children}</div>
    </div>
  );
};

export default InfoTile;
