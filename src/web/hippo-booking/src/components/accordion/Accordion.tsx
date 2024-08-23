import { useState } from "react";
import "./Accordion.scss";

type AccordionProps = {
  name: string;
  children: React.ReactNode;
};

const AccordionItem = ({ name, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='accordion-item'>
      <div className='accordion-header' onClick={toggleAccordion}>
        <div className='accordion-title'>{name}</div>
        <span className={`arrow ${isOpen ? "open" : ""}`}>&#9660;</span>
      </div>
      {isOpen && <div className='accordion-content'>{children}</div>}
    </div>
  );
};

export { AccordionItem };
