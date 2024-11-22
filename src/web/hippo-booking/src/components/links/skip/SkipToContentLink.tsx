import { Link } from "react-router-dom";
import "./SkipToContentLink.scss";

type SkipToContentLinkProps = {
    skipToElementRef: React.RefObject<HTMLElement>;
}

const SkipToContentLink = ({skipToElementRef} : SkipToContentLinkProps) => {

    const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (skipToElementRef.current){
            skipToElementRef.current.setAttribute('tabindex', '-1');
            skipToElementRef.current?.focus();

            skipToElementRef.current.addEventListener(
                'blur',
                () => {
                    skipToElementRef.current?.removeAttribute('tabindex');
                },
                { once: true }
            );
        };
    };

    return (
        <div className='skip-link-container'>
            <Link tabIndex={1} className='skip-link' to='#' onClick={handleSkip}>Skip to main content</Link>
        </div>
    )
}

export default SkipToContentLink;