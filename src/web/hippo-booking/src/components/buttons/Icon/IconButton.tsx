import { isNullOrEmpty } from "../../../helpers/StringHelpers";
import "./IconButton.scss";

type IconButtonProps = {
    color: 'navy' | 'grey';
    iconSrc: string;
    title: string;
    ariaLabel?: string;
    onClick: () => void;
    showBorder: boolean;
    showText: boolean;
    disabled?: boolean;
};

const IconButton = ({iconSrc, title, onClick, color, showBorder, showText, disabled = false, ariaLabel} : IconButtonProps) => {
    return (
        <button 
            className={'icon-button icon-button__' + color + (showBorder == true ? ' icon-button__border': '')} 
            title={title} 
            aria-label={isNullOrEmpty(ariaLabel) ? title : ariaLabel} 
            onClick={onClick} 
            aria-disabled={disabled}>
            <img alt="" src={iconSrc}/>
            {showText && <span>{title}</span>}
        </button>
    )
};

export default IconButton;