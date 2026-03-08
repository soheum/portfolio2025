import React, { useEffect, useRef, useState } from 'react';
import '../components/Box12.css';
import './About2.css';

const About2: React.FC = () => {
  const [data, setData] = useState([14.7, 14.6, 14.8, 14.5, 15.3, 14.6, 14.7, 14.7, 14.5, 14.6, 14.7, 14.8, 14.9, 14.4, 14.3, 14.2, 14.6, 14.7, 14.7, 14.8, 14.7, 14.8, 14.9, 14.6, 14.8, 14.8]);
  const [dragging, setDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState(43);

  const cardRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<SVGSVGElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const valueElRef = useRef<HTMLDivElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const lineLeftRef = useRef<SVGPathElement>(null);
  const lineRightRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const clipLeftRectRef = useRef<SVGRectElement>(null);
  const clipRightRectRef = useRef<SVGRectElement>(null);
  const verticalLinesRef = useRef<SVGGElement>(null);
  const verticalLinesBackgroundRef = useRef<SVGGElement>(null);
  const dragLineRef = useRef<SVGLineElement>(null);

  const valueAnimIdRef = useRef(0);
  const minYRef = useRef(0);
  const maxYRef = useRef(0);
  const rangeYRef = useRef(1);

  const viewBoxWidth = 100;
  const viewBoxHeight = 80;

  function recomputeRange() {
    const dataMin = Math.min(...data);
    const dataMax = Math.max(...data);
    const dataRange = dataMax - dataMin;
    const minRange = 2.0;
    const padding = Math.max(0, (minRange - dataRange) / 2);
    minYRef.current = dataMin - padding;
    maxYRef.current = dataMax + padding;
    rangeYRef.current = maxYRef.current - minYRef.current || 1;
  }

  const n = () => data.length;

  function point(i: number) {
    const x = (i / (n() - 1)) * viewBoxWidth;
    const normalizedY = (data[i] - minYRef.current) / rangeYRef.current;
    const bottomPadding = 2;
    const topPadding = 2;
    const usableHeight = viewBoxHeight - topPadding - bottomPadding;
    const y = topPadding + (1 - normalizedY) * usableHeight;
    return { x, y };
  }

  function generateTopLinePath() {
    const pts = [];
    for (let i = 0; i < n(); i += 1) pts.push(point(i));
    if (pts.length === 0) return '';

    let d = `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 1) return d;

    for (let i = 0; i < pts.length - 1; i += 1) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const x1 = p1.x + (p2.x - p0.x) / 6;
      const y1 = p1.y + (p2.y - p0.y) / 6;
      const x2 = p2.x - (p3.x - p1.x) / 6;
      const y2 = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${x1} ${y1}, ${x2} ${y2}, ${p2.x} ${p2.y}`;
    }

    return d;
  }

  function generateAreaPath() {
    let d = generateTopLinePath();
    d += ` L ${viewBoxWidth} ${viewBoxHeight} L 0 ${viewBoxHeight} Z`;
    return d;
  }

  function snapToNearestIndex(t: number) {
    const count = n() - 1;
    const pos = t * count;
    const i = Math.round(pos);
    return Math.max(0, Math.min(i, count));
  }

  function getTForIndex(i: number) {
    const count = n() - 1;
    return count > 0 ? i / count : 0;
  }

  function getPointAtIndex(i: number) {
    const clampedIndex = Math.max(0, Math.min(i, n() - 1));
    return point(clampedIndex);
  }

  function updateVerticalLinesBackground() {
    if (!verticalLinesBackgroundRef.current) return;
    verticalLinesBackgroundRef.current.innerHTML = '';
    for (let i = 0; i < n(); i += 1) {
      const { x } = point(i);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', viewBoxHeight.toString());
      verticalLinesBackgroundRef.current.appendChild(line);
    }
  }

  function updateVerticalLines() {
    if (!verticalLinesRef.current) return;
    verticalLinesRef.current.innerHTML = '';
    for (let i = 0; i < n(); i += 1) {
      const { x, y } = point(i);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', viewBoxHeight.toString());
      verticalLinesRef.current.appendChild(line);
    }
  }

  function updatePaths() {
    if (!areaPathRef.current || !lineLeftRef.current || !lineRightRef.current) return;
    const topLinePath = generateTopLinePath();
    areaPathRef.current.setAttribute('d', generateAreaPath());
    lineLeftRef.current.setAttribute('d', topLinePath);
    lineRightRef.current.setAttribute('d', topLinePath);
    updateVerticalLinesBackground();
    updateVerticalLines();
  }

  function updateClipRects(index: number) {
    if (!clipLeftRectRef.current || !clipRightRectRef.current) return;
    const t = getTForIndex(index);
    const xSplit = t * viewBoxWidth;
    clipLeftRectRef.current.setAttribute('width', xSplit.toString());

    const minRightWidth = 1;
    let rightWidth = viewBoxWidth - xSplit;
    if (rightWidth < minRightWidth) rightWidth = minRightWidth;
    rightWidth += 1;

    clipRightRectRef.current.setAttribute('x', xSplit.toString());
    clipRightRectRef.current.setAttribute('width', rightWidth.toString());
  }

  function updateCirclePosition(index: number) {
    if (!circleRef.current) return;
    const { x, y } = getPointAtIndex(index);
    circleRef.current.setAttribute('cx', x.toString());
    circleRef.current.setAttribute('cy', y.toString());
  }

  function updateDragLinePosition(t: number) {
    if (!dragLineRef.current) return;
    const x = t * viewBoxWidth;
    dragLineRef.current.setAttribute('x1', x.toString());
    dragLineRef.current.setAttribute('x2', x.toString());
  }

  function animateValue(to: number) {
    if (!valueElRef.current) return;
    valueElRef.current.classList.add('bump');
    setTimeout(() => {
      if (valueElRef.current) valueElRef.current.classList.remove('bump');
    }, 180);

    const from = displayValue;
    const start = performance.now();
    const duration = 250;
    const localId = ++valueAnimIdRef.current;

    function frame(now: number) {
      if (localId !== valueAnimIdRef.current) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplayValue(Math.round(current));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function updateValueFromGraph(index: number) {
    const y = data[index];
    const minData = Math.min(...data);
    const maxData = Math.max(...data);
    const normalized = (y - minData) / (maxData - minData || 1);
    const num = Math.round(35 + normalized * (80 - 35));
    animateValue(num);
  }

  function updateUI(index: number) {
    if (!dividerRef.current || !valueElRef.current) return;
    const t = getTForIndex(index);
    const xPercent = t * 100;
    dividerRef.current.style.left = `${xPercent}%`;
    valueElRef.current.style.left = `${xPercent}%`;
    updateClipRects(index);
    updateValueFromGraph(index);
    updateCirclePosition(index);
    updateDragLinePosition(t);
  }

  useEffect(() => {
    recomputeRange();
    updatePaths();
    const initialIndex = Math.floor((n() - 1) / 2);
    setCurrentIndex(initialIndex);
    updateUI(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    recomputeRange();
    updatePaths();
    updateUI(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentIndex]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === circleRef.current || e.target === dragLineRef.current) {
        e.stopPropagation();
        setDragging(true);
      }
    };

    const handleMouseUp = () => setDragging(false);

    const handleMouseMove = (e: MouseEvent) => {
      if (!graphRef.current || !cardRef.current) return;

      if (dragging) {
        const svgRect = graphRef.current.getBoundingClientRect();
        const screenY = e.clientY - svgRect.top;
        const viewBox = graphRef.current.viewBox.baseVal;
        const scale = Math.min(svgRect.width / viewBox.width, svgRect.height / viewBox.height);
        const scaledHeight = viewBox.height * scale;
        const yOffset = svgRect.height - scaledHeight;
        const viewBoxY = (screenY - yOffset) / scale;

        const topPadding = 2;
        const bottomPadding = 2;
        const yClamped = Math.min(viewBoxHeight - bottomPadding, Math.max(topPadding, viewBoxY));
        const usableHeight = viewBoxHeight - topPadding - bottomPadding;
        const normalizedY = 1 - (yClamped - topPadding) / usableHeight;
        const newValue = minYRef.current + normalizedY * rangeYRef.current;

        const newData = [...data];
        newData[currentIndex] = newValue;
        setData(newData);
      } else {
        const graphRect = graphRef.current.getBoundingClientRect();
        const withinX = e.clientX >= graphRect.left && e.clientX <= graphRect.right;
        const withinY = e.clientY >= graphRect.top && e.clientY <= graphRect.bottom;
        if (!withinX || !withinY) return;

        let t = (e.clientX - graphRect.left) / graphRect.width;
        t = Math.min(1, Math.max(0, t));
        const snappedIndex = snapToNearestIndex(t);
        if (snappedIndex !== currentIndex) setCurrentIndex(snappedIndex);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, currentIndex, data]);

  return (
    <main className="about2-page">
      <div className="about2-frame">
        <div ref={cardRef} className={`card ${dragging ? 'dragging' : ''}`}>
          <div className="hover-text">try dragging the dot up and down</div>
          <div ref={valueElRef} className="value">{displayValue}</div>
          <svg ref={graphRef} id="graph" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="area-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#1E1D1C" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="vertical-lines-gradient" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2D2D2D" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <clipPath id="clip-left">
                <rect ref={clipLeftRectRef} id="clip-left-rect" x="0" y="0" width="50" height="80" />
              </clipPath>
              <clipPath id="clip-right">
                <rect ref={clipRightRectRef} id="clip-right-rect" x="50" y="0" width="50" height="80" />
              </clipPath>
            </defs>
            <path ref={areaPathRef} id="area" />
            <g ref={verticalLinesBackgroundRef} id="vertical-lines-background" />
            <g ref={verticalLinesRef} id="vertical-lines" />
            <path ref={lineLeftRef} id="line-left" clipPath="url(#clip-left)" />
            <path ref={lineRightRef} id="line-right" clipPath="url(#clip-right)" />
            <line ref={dragLineRef} id="drag-line" x1="50" y1="0" x2="50" y2="80" stroke="transparent" strokeWidth="3" />
            <circle ref={circleRef} id="intersection-circle" fill="#ffffff" />
          </svg>
          <div ref={dividerRef} id="divider" />
        </div>
      </div>
    </main>
  );
};

export default About2;
