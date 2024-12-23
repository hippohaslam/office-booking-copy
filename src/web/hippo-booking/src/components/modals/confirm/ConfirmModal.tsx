import { CtaButton } from "../..";
import "./ConfirmModal.scss";
import { useEffect, useRef, type JSX } from "react";

type BookingCancelModalProps = {
  title: string;
  isOpen: boolean;
  childElement?: JSX.Element;
  showConfirmButton: boolean;
  onConfirm?: () => void;
  confirmButtonLabel?: string;
  confirmButtonColor?: "cta-green" | "cta-red";
  confirmButtonDisabled?: boolean;
  confirmButtonLoading?: boolean;
  onCancel: () => void;
  cancelButtonLabel: string;
  cancelButtonColor?: "cta-green" | "cta-red";
  cancelButtonDisabled?: boolean;
};

const BookingCancelModal = ({
  title,
  isOpen,
  childElement,
  showConfirmButton,
  onConfirm,
  confirmButtonLabel,
  confirmButtonColor = "cta-green",
  confirmButtonDisabled = false,
  confirmButtonLoading = false,
  onCancel,
  cancelButtonLabel,
  cancelButtonColor = "cta-red",
  cancelButtonDisabled = false
}: BookingCancelModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (modalRef.current) {
        modalRef.current.focus();
        modalRef.current.setAttribute("tabindex", "-1");
      }
    }
  }, [isOpen]);

  const handleCloseModalClick = () => {
    if (cancelButtonDisabled) {
      return;
    }
    closeModal();
  }

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.add("out");
    }
    if (overlayRef.current) {
      overlayRef.current.classList.add("out");
    }
    // Timeout 200 is for the duration of exit animation
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      overlayRef.current &&
      (overlayRef.current as HTMLElement).contains(event.target as Node) &&
      !document.getElementById("cancel-booking-modal")?.contains(event.target as Node)
    ) {
      closeModal();
    }
  };
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    };

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (cancelButtonDisabled) {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [cancelButtonDisabled]);

  if (!isOpen) return null;
  return (
    <div className='modal-overlay' ref={overlayRef} data-testid='modal-page-overlay'>
      <div
        className='modal-booking'
        ref={modalRef}
        id='cancel-booking-modal'
        role='alertdialog'
        aria-labelledby='cancel-modal-heading'
        aria-describedby='cancel-modal-booking-info'
        aria-modal='true'
      >
        <div id="modal-content">
          <h2 id='cancel-modal-heading'>{title}</h2>
          {childElement}
          <div className="cta-button-group cta-button-group__full-width">
            {showConfirmButton ? (
              <CtaButton text={confirmButtonLabel ?? ""} color={confirmButtonColor} onClick={onConfirm} disabled={confirmButtonDisabled} isLoading={confirmButtonLoading}/>
            ) : null}
            <CtaButton text={cancelButtonLabel} color={cancelButtonColor} onClick={handleCloseModalClick} disabled={cancelButtonDisabled}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelModal;
