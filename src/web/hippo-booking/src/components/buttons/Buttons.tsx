type CtaButtonProps = {
    text: string;
    type?: 'button' | 'submit';
    color: 'cta-green' | 'cta-pink' | 'cta-navy' | 'cta-yellow';
    onClick?: () => void;
}

// Not married to this, just trying it out

const CtaButton = ({text, type, color, onClick}: CtaButtonProps) => {
    return (
        <button type={type ?? 'button'} className={`cta ${color ?? ""}`} onClick={onClick}>{text}</button>
    );
}

export {
    CtaButton
};