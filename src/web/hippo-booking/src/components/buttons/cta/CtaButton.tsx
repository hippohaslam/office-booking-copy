import React, { useEffect, useRef } from "react";
import Loader from "../../../assets/3-dots-loader.svg";
import "./CtaButton.scss";

type CtaButtonProps = {
  text: string;
  type?: "button" | "submit";
  color: "cta-green" | "cta-pink" | "cta-navy" | "cta-yellow" | "cta-red" | "cta-grey";
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

// Not married to this, just trying it out

const CtaButton = React.forwardRef<HTMLButtonElement, CtaButtonProps>(({ text, type, color, onClick, disabled = false, isLoading = false}, ref) => {
  const iconRef = useRef<HTMLImageElement>(null);

  // Hidden so that it should have loaded when shown on slow connection
  useEffect(() => {
    if (iconRef.current) {
      if (isLoading) {
        iconRef.current.hidden = false;
      }
      else {
        iconRef.current.hidden = true;
      }
    }

  }, [isLoading])

  return (
    <button ref={ref} type={type ?? "button"} className={`cta ${color ?? ""}`} onClick={onClick} aria-disabled={disabled} aria-label={isLoading ? text.toLowerCase() : ""}>
      {isLoading ? "" : text}
      <img alt="" src={Loader} ref={iconRef}/>
    </button>
  );
});

export default CtaButton;
