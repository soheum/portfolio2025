import React, { useCallback, useRef, useState } from 'react';
import {
  buildSkyGradient,
  formatMarkerTime,
  formatMinutesAsMarkerTime,
  getLondonMinutesFromMidnight,
  minutesToPercent,
  percentToMinutes,
} from '../utils/londonSky';
import './SkyTimeline.css';

type SkyTimelineProps = {
  now: Date;
  sunrise: Date | null;
  sunset: Date | null;
};

type MarkerProps = {
  topPercent: number;
  label: React.ReactNode;
  variant?: 'default' | 'now' | 'hover';
};

const Marker: React.FC<MarkerProps> = ({ topPercent, label, variant = 'default' }) => (
  <div
    className={`sky-timeline__marker${
      variant === 'now'
        ? ' sky-timeline__marker--now'
        : variant === 'hover'
          ? ' sky-timeline__marker--hover'
          : ''
    }`}
    style={{ top: `${topPercent}%` }}
  >
    <span className="sky-timeline__tick" aria-hidden="true" />
    <span className="sky-timeline__label">{label}</span>
  </div>
);

const SkyTimeline: React.FC<SkyTimelineProps> = ({ now, sunrise, sunset }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  const nowMinutes = getLondonMinutesFromMidnight(now);
  const nowPercent = minutesToPercent(nowMinutes);
  const sunrisePercent = sunrise ? minutesToPercent(getLondonMinutesFromMidnight(sunrise)) : null;
  const sunsetPercent = sunset ? minutesToPercent(getLondonMinutesFromMidnight(sunset)) : null;

  const activePercent = hoverPercent ?? nowPercent;

  const updateHoverPercent = useCallback((clientY: number) => {
    const bar = barRef.current;
    if (!bar) return;

    const { top, height } = bar.getBoundingClientRect();
    const y = clientY - top;
    const percent = Math.max(0, Math.min(100, (y / height) * 100));
    setHoverPercent(percent);
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      updateHoverPercent(event.clientY);
    },
    [updateHoverPercent],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPercent(null);
  }, []);

  const hoverMinutes = hoverPercent !== null ? percentToMinutes(hoverPercent) : null;

  return (
    <div className="sky-timeline" aria-hidden="true">
      <div
        ref={barRef}
        className="sky-timeline__bar"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="sky-timeline__sky"
          style={{
            background: buildSkyGradient(),
            clipPath: `inset(0 0 ${100 - activePercent}% 0)`,
          }}
        />
        <div className="sky-timeline__future" style={{ top: `${activePercent}%` }} />
      </div>

      <div className="sky-timeline__markers">
        {sunrise && sunrisePercent !== null && (
          <Marker topPercent={sunrisePercent} label={`sunrise: ${formatMarkerTime(sunrise)}`} />
        )}
        <Marker
          topPercent={nowPercent}
          variant="now"
          label={<span className="sky-timeline__label-now">now: {formatMarkerTime(now)}</span>}
        />
        {hoverPercent !== null && hoverMinutes !== null && (
          <Marker
            topPercent={hoverPercent}
            variant="hover"
            label={<span className="sky-timeline__label-hover">{formatMinutesAsMarkerTime(hoverMinutes)}</span>}
          />
        )}
        {sunset && sunsetPercent !== null && (
          <Marker topPercent={sunsetPercent} label={`sunset: ${formatMarkerTime(sunset)}`} />
        )}
      </div>
    </div>
  );
};

export default SkyTimeline;
