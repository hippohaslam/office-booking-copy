import { useEffect, useState } from "react";

const UseWindowSize = () => {
    const [dimensions, setDimensions] = useState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    
      useEffect(() => {
        const handleResize = () => {
          setDimensions({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
          });
        };
    
        window.addEventListener('resize', handleResize);
    
        // Cleanup event listener on component unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

      return dimensions;
    };

export {UseWindowSize as useWindowSize};