import React, { useMemo, useState } from 'react';
import './vinyl.css';

interface VinylBrowserProps {
  covers: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const VinylBrowser: React.FC<VinylBrowserProps> = ({ covers }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = covers.length;
  const safeActiveIndex = clamp(activeIndex, 0, Math.max(0, total - 1));

  const cards = useMemo(
    () =>
      covers.map((cover, index) => {
        const offset = index - safeActiveIndex;
        const distance = Math.abs(offset);
        const translateX = 0;
        const translateZ = -distance * 110;
        const rotateY = offset * -2;
        const translateY = distance * 15;
        const opacity = clamp(1 - distance * 0.2, 0.35, 1);
        const scale = offset === 0 ? 1.04 : 0.88;
        const zIndex = index === safeActiveIndex ? total + 200 : total - distance;

        // Offset from active drives horizontal spread, Y-rotation, and depth.
        const transform = [
          `translateX(${translateX}px)`,
          `translateZ(${translateZ}px)`,
          `rotateY(${rotateY}deg)`,
          `translateY(${translateY}px)`,
          `scale(${scale})`,
        ].join(' ');

        return {
          cover,
          index,
          offset,
          distance,
          opacity,
          transform,
          zIndex,
        };
      }),
    [covers, safeActiveIndex]
  );

  const goPrev = () => setActiveIndex((prev) => clamp(prev - 1, 0, Math.max(0, total - 1)));
  const goNext = () => setActiveIndex((prev) => clamp(prev + 1, 0, Math.max(0, total - 1)));

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (event.deltaY > 0) {
      goNext();
    } else if (event.deltaY < 0) {
      goPrev();
    }
  };

  return (
    <section className="vinyl-scene" onWheel={handleWheel} aria-label="Vinyl crate browser">
      <div className="vinyl-row" role="list">
        {cards.map(({ cover, index, opacity, transform, zIndex }) => (
          <button
            key={`${cover}-${index}`}
            type="button"
            className={`vinyl-card ${index === safeActiveIndex ? 'is-active' : ''}`}
            style={{
              transform,
              opacity,
              zIndex,
            }}
            onClick={() => setActiveIndex(index)}
            aria-label={`Select record ${index + 1}`}
            aria-pressed={index === safeActiveIndex}
            role="listitem"
          >
            <img src={cover} alt={`Vinyl cover ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      <div className="vinyl-controls">
        <button type="button" onClick={goPrev} disabled={safeActiveIndex === 0}>
          Prev
        </button>
        <span>
          {safeActiveIndex + 1} / {total}
        </span>
        <button type="button" onClick={goNext} disabled={safeActiveIndex === total - 1}>
          Next
        </button>
      </div>
    </section>
  );
};

export default VinylBrowser;
