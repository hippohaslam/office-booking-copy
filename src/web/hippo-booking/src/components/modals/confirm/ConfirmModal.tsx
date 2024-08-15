import "./ConfirmModal.scss"
import { CtaButton } from "../../buttons/Buttons";
import { useEffect, useRef } from "react";

type BookingCancelModalProps = {
    title: string;
    isOpen: boolean;
    childElement?: JSX.Element;
    showConfirmButton: boolean;
    onConfirm?: () => void;
    confirmButtonLabel?: string;
    confirmButtonColor?: 'cta-green' | "cta-red";
    onCancel: () => void;
    cancelButtonLabel: string;
    cancelButtonColor?: 'cta-green' | "cta-red";
}

const BookingCancelModal = ({title, isOpen, childElement, showConfirmButton, onConfirm, confirmButtonLabel, confirmButtonColor = 'cta-green', onCancel, cancelButtonLabel, cancelButtonColor = 'cta-red'} : BookingCancelModalProps) => {
    const firstButtonRef = useRef<HTMLButtonElement>(null);
    const overlayRef = useRef(null);
    
    useEffect(() => {
        if (isOpen) {
            if (firstButtonRef.current) {
                firstButtonRef.current.focus();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && (overlayRef.current as HTMLElement).contains(event.target as Node) && !document.getElementById("cancel-booking-modal")?.contains(event.target as Node)) {
                onCancel();
            }
        };
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape'){
                onCancel();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscapeKey)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey)
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" ref={overlayRef} data-testid="modal-page-overlay">
            <div className="modal-booking" id="cancel-booking-modal" role="alertdialog" aria-labelledby="cancel-modal-heading" aria-describedby="cancel-modal-booking-info" aria-modal="true">
                <h2 id="cancel-modal-heading">{title}</h2>
                {childElement}
                {showConfirmButton ? (
                    <CtaButton ref={firstButtonRef} text={confirmButtonLabel ?? ""} color={confirmButtonColor} onClick={onConfirm} />
                ) : null}
                <CtaButton text={cancelButtonLabel} color={cancelButtonColor} onClick={onCancel} />
            </div>
        </div>
    )
}

export default BookingCancelModal;