import { useRef, useEffect } from "react";
import { CtaButton } from "../..";

type SelectModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: JSX.Element;
};

const SelectModal = ({ title, isOpen, onClose, children }: SelectModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (modalRef.current) {
        modalRef.current.setAttribute("tabindex", "-1");
        modalRef.current.focus();
      }
    }
  }, [isOpen]);

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.add("out");
    }
    if (overlayRef.current) {
      overlayRef.current.classList.add("out");
      onClose();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      overlayRef.current &&
      (overlayRef.current as HTMLElement).contains(event.target as Node) &&
      !document.getElementById("select-modal")?.contains(event.target as Node)
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className='modal-overlay' ref={overlayRef} data-testid='modal-page-overlay'>
      <div
        className='modal-booking'
        ref={modalRef}
        id='select-modal'
        role='alertdialog'
        aria-labelledby='select-modal-heading'
        aria-describedby='select-modal-booking-info'
        aria-modal='true'
      >
        <div id='modal-content'>
          <h2 id='select-modal-heading'>{title}</h2>
          {children}
        </div>
        <div>
          <CtaButton color='cta-green' text="Cancel" onClick={onClose}/>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;
