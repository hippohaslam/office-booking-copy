import React from "react";

type CtaButtonProps = {
    text: string;
    type?: 'button' | 'submit';
    color: 'cta-green' | 'cta-pink' | 'cta-navy' | 'cta-yellow' | "cta-red";
    onClick?: () => void;
}

// Not married to this, just trying it out

const CtaButton = React.forwardRef<HTMLButtonElement, CtaButtonProps>(({text, type, color, onClick}, ref) => {
    return (
        <button ref={ref} type={type ?? 'button'} className={`cta ${color ?? ""}`} onClick={onClick}>{text}</button>
    );
})

export{
    CtaButton
};