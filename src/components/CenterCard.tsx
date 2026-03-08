import React from 'react';
import { Link } from 'react-router-dom';
import ScrambleText from './ScrambleText';
import './CenterCard.css';

interface CenterCardProps {
  text: string;
  startReveal: boolean;
  typedSegment?: string;
  highlightSegments?: string[];
  scrollHint?: string;
  focusLineIndex?: number | null;
}

const CenterCard: React.FC<CenterCardProps> = ({
  text,
  startReveal,
  typedSegment,
  highlightSegments,
  scrollHint,
  focusLineIndex,
}) => {
  const fullName = "@soheum";

  const textLines = text.split('\n');

  /* Match [1], [2], [x], [X], [3], etc. for badge styling */
  const labelRegex = /\[\d+\]|\[x\]/gi;

  const renderWithHighlights = (str: string, keyPrefix: string): React.ReactNode => {
    if (!highlightSegments || highlightSegments.length === 0) {
      return str;
    }
    let remaining = str;
    const parts: React.ReactNode[] = [];
    highlightSegments.forEach((segment, index) => {
      if (!segment || !remaining.includes(segment)) {
        return;
      }
      const segmentIndex = remaining.indexOf(segment);
      const before = remaining.slice(0, segmentIndex);
      const after = remaining.slice(segmentIndex + segment.length);
      parts.push(before);
      parts.push(
        <span key={`${keyPrefix}-${segment}-${index}`} className="center-card__text-highlight">
          {segment}
        </span>
      );
      remaining = after;
    });
    if (parts.length === 0) {
      return str;
    }
    parts.push(remaining);
    return parts;
  };

  const applyHighlightToText = (str: string, keyPrefix: string): React.ReactNode => {
    const parts = str.split(/(Previously)/g);
    if (parts.length === 1) {
      return renderWithHighlights(str, keyPrefix);
    }
    return parts.map((part, idx) => {
      if (part === 'Previously') {
        return (
          <span key={`${keyPrefix}-previously-${idx}`} className="center-card__text-previously">
            {part}
          </span>
        );
      }
      return (
        <React.Fragment key={`${keyPrefix}-text-${idx}`}>
          {renderWithHighlights(part, `${keyPrefix}-text-${idx}`)}
        </React.Fragment>
      );
    });
  };

  const renderHighlightedLine = (line: string) => {
    const segments = line.split(labelRegex);
    const matches = line.match(labelRegex) || [];
    const result: React.ReactNode[] = [];
    segments.forEach((segment, i) => {
      result.push(applyHighlightToText(segment, `line-segment-${i}`));
      if (matches[i]) {
        result.push(
          <span key={`label-${i}-${matches[i]}`} className="center-card__text-label">
            {matches[i]}
          </span>
        );
      }
    });
    return result.length > 1 ? result : applyHighlightToText(line, 'line');
  };

  return (
    <div className={`center-card ${startReveal ? 'center-card--reveal' : 'center-card--hidden'}`}>
      <h1 className="center-card__name">
        <a
          href="https://x.com/soheum8014"
          target="_blank"
          rel="noopener noreferrer"
          className="center-card__name-text center-card__name-link center-card__reveal center-card__reveal--name"
        >
          {fullName}
        </a>
      </h1>
      <p className="center-card__text">
        {textLines.map((line, index) => {
          if (typedSegment && line.includes(typedSegment)) {
            const [before, after] = line.split(typedSegment);
            return (
              <span
                key={`${index}-${line}`}
                className="center-card__text-line center-card__reveal center-card__reveal--text"
              >
                {before}
                <span
                  className="center-card__typed"
                  style={{ ['--type-characters' as string]: typedSegment.length } as React.CSSProperties}
                >
                  {typedSegment}
                </span>
                {after}
              </span>
            );
          }

          return (
            <span
              key={`${index}-${line}`}
              className={`center-card__text-line center-card__reveal center-card__reveal--text ${
                focusLineIndex !== null && focusLineIndex !== undefined && index !== focusLineIndex
                  ? 'center-card__text-line--muted'
                  : ''
              }`}
            >
              {renderHighlightedLine(line)}
            </span>
          );
        })}
      </p>
      <div className="center-card__footer">
        <div className="center-card__footer-row">
          {/* <p className="center-card__links center-card__footer-text">
          A strong believer that creativity thrives within constraints, I design digital experiences while staying grounded in physical craft—working at the pottery wheel and shaping clay by hand. I explore how AI can enhance our lives, while also creating hand-curated travel content through photography and writing.
            
          </p> */}
          {/* <Link to="/about" className="center-card__link center-card__link--about">
            <ScrambleText>About me</ScrambleText>
          </Link> */}
        </div>
        {scrollHint ? (
          <p className="center-card__scroll-hint">{scrollHint}</p>
        ) : null}
      </div>
    </div>
  );
};

export default CenterCard;
