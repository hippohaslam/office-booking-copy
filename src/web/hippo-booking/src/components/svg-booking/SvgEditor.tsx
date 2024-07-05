import { useRef, useState, useEffect } from "react";

// ! Experimental SVG Editor. partially working. Does not use API so saving here is just local storage.

interface SvgElementWithId {
    id: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cx?: number;
    cy?: number;
    r?: number;
    fill: string;
}

const SvgEditor = () => {
    const [elements, setElements] = useState<SvgElementWithId[]>([]);
    const [dragging, setDragging] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [viewBox, setViewBox] = useState([0, 0, 600, 400]);
  
    const svgRef = useRef<SVGSVGElement | null>(null);
  
    useEffect(() => {
      const savedElements = localStorage.getItem('svgElements');
      if (savedElements) {
        setElements(JSON.parse(savedElements));
      } else {
        setElements([
          { id: 1, x: 50, y: 50, width: 200, height: 100, fill: 'lightblue' },
          { id: 2, x: 300, y: 50, width: 200, height: 100, fill: 'lightgreen' },
          { id: 3, cx: 150, cy: 300, r: 50, fill: 'lightcoral' }
        ]);
      }
    }, []);
  
    const getMousePosition = (e) => {
      if(svgRef.current){
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        return cursorPoint;
      }
    };
  
    const handleMouseDown = (e: any, index: number) => {
      const element = elements[index];
      const cursorPoint = getMousePosition(e);
      const offsetX = cursorPoint.x - (element.cx || element.x);
      const offsetY = cursorPoint.y - (element.cy || element.y);
      setDragging(index);
      setOffset({ x: offsetX, y: offsetY });
    };
  
    const handleMouseMove = (e) => {
      if (dragging !== null) {
        const cursorPoint = getMousePosition(e);
        const updatedElements = elements.map((element, index) => {
          if (index === dragging) {
            const x = cursorPoint.x - offset.x;
            const y = cursorPoint.y - offset.y;
            return element.cx ? { ...element, cx: x, cy: y } : { ...element, x, y };
          }
          return element;
        });
        setElements(updatedElements);
      }
    };
  
    const handleMouseUp = () => {
      setDragging(null);
    };
  
    const zoomIn = () => {
      const [x, y, width, height] = viewBox;
      const newWidth = width * 0.8;
      const newHeight = height * 0.8;
      setViewBox([x + (width - newWidth) / 2, y + (height - newHeight) / 2, newWidth, newHeight]);
    };
  
    const zoomOut = () => {
      const [x, y, width, height] = viewBox;
      const newWidth = width / 0.8;
      const newHeight = height / 0.8;
      setViewBox([x - (newWidth - width) / 2, y - (newHeight - height) / 2, newWidth, newHeight]);
    };
  
    const handleWheel = (e) => {
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };
  
    const saveToLocalStorage = () => {
      const svgState = JSON.stringify(elements);
      localStorage.setItem('svgElements', svgState);
    };
  
    return (
      <div>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={saveToLocalStorage}>Save</button>
        <svg
          ref={svgRef}
          width="600"
          height="400"
          viewBox={viewBox.join(' ')}
          style={{ border: '1px solid black' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {elements.map((element, index) => (
            element.cx ? (
              <circle
                key={element.id}
                cx={element.cx}
                cy={element.cy}
                r={element.r}
                fill={element.fill}
                stroke="black"
                onMouseDown={(e) => handleMouseDown(e, index)}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <rect
                key={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                stroke="black"
                onMouseDown={(e) => handleMouseDown(e, index)}
                style={{ cursor: 'pointer' }}
              />
            )
          ))}
        </svg>
      </div>
  );
}

export default SvgEditor;