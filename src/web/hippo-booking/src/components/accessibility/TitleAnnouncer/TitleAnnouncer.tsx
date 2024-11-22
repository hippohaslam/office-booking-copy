import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import "./TitleAnnoucer.scss";

const TitleAnnouncer = () => {
  const [title, setTitle] = useState<string>('');
  const titleRef = useRef<HTMLParagraphElement>(null);
  const { pathname } = useLocation();

  const onHelmetChange = (state: { title?: string }) => {
    if (state.title) setTitle(state.title);
  };

  useEffect(() => {
    if (titleRef.current){
      titleRef.current.focus();
    } 
  }, [pathname]);

  return (
    <>
      <p tabIndex={-1} ref={titleRef} className="sr-only">
        {title}
      </p>

      <Helmet onChangeClientState={onHelmetChange} />
    </>
  );
};

export default TitleAnnouncer;