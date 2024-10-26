import { useEffect, useRef, useState } from "react";
import "./Accordion.scss";
import Arrow from "../../assets/cta-arrow-navy.svg";
import { isNullOrEmpty, sanitiseForId } from "../../helpers/StringHelpers";

type AccordionGroupProps = {
  children : React.ReactNode;
}

type AccordionItemProps = {
  name: string;
  id?: string;
  children: React.ReactNode;
};

const AccordionGroup = ({children} : AccordionGroupProps) => {
  return (
    <div className="accordion">
      {children}
    </div>
  )
}

const AccordionItem = ({ name, children, id }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const accordionIcon = useRef<HTMLImageElement>(null);
  const accordionButton = useRef<HTMLButtonElement>(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      accordionIcon.current && accordionIcon.current.classList.add('open');
      accordionButton.current && accordionButton.current.classList.add('open');
    };
    if (!isOpen) {
      accordionIcon.current && accordionIcon.current.classList.remove('open');
      accordionButton.current && accordionButton.current.classList.remove('open');
    };
  }, [isOpen]);

  const accordionButtonId = 'accordion-button-' + (isNullOrEmpty(id) ? sanitiseForId(name) : id);
  const accordionPanelId = 'accordion-panel-' + (isNullOrEmpty(id) ? sanitiseForId(name) : id);

  console.log(accordionButtonId);
  return (
    <>
      <h3>
        <button id={accordionButtonId} aria-controls={accordionPanelId} 
          className='accordion-header' onClick={toggleAccordion} aria-expanded={isOpen}>
          {name}
          <img ref={accordionIcon} className='accordion-arrow' src={Arrow} alt=''/>
        </button>
      </h3>
      {isOpen && <div id={accordionPanelId} className='accordion-content' aria-labelledby={accordionButtonId}>{children}</div>}
    </>
  );
};

export { AccordionGroup, AccordionItem };
