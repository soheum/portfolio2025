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
}

const CenterCard: React.FC<CenterCardProps> = ({
  text,
  startReveal,
  typedSegment,
  highlightSegments,
  scrollHint,
}) => {
  const fullName = "Soheum Hwang";

  const textLines = text.split('\n');

  const renderHighlightedLine = (line: string) => {
    if (!highlightSegments || highlightSegments.length === 0) {
      return line;
    }

    let remaining = line;
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
        <span key={`${segment}-${index}`} className="center-card__text-highlight">
          {segment}
        </span>
      );

      remaining = after;
    });

    if (parts.length === 0) {
      return line;
    }

    parts.push(remaining);
    return parts;
  };

  return (
    <div className={`center-card ${startReveal ? 'center-card--reveal' : 'center-card--hidden'}`}>
      <h1 className="center-card__name">
        <span className="center-card__name-text center-card__reveal center-card__reveal--name">
          {fullName}
        </span>
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
              className="center-card__text-line center-card__reveal center-card__reveal--text"
            >
              {renderHighlightedLine(line)}
            </span>
          );
        })}
      </p>
      <div className="center-card__footer">
        <div className="center-card__footer-row">
          <p className="center-card__links">
            <a href="https://www.linkedin.com/in/so-heum-hwang/" className="center-card__link" target="_blank" rel="noopener noreferrer">
              <ScrambleText>LinkedIn</ScrambleText>
            </a>
            {' / '}
            <a href="/files/Soheum_CV.pdf" className="center-card__link" target="_blank" rel="noopener noreferrer">
              <ScrambleText>CV</ScrambleText>
            </a>
            {' / '}
            <a href="mailto:sohheum@gmail.com" className="center-card__link">
              <ScrambleText>Email</ScrambleText>
            </a>
          </p>
          <Link to="/about" className="center-card__link center-card__link--about">
            <ScrambleText>About me</ScrambleText>
          </Link>
        </div>
        {scrollHint ? (
          <p className="center-card__scroll-hint">{scrollHint}</p>
        ) : null}
      </div>
    </div>
  );
};

export default CenterCard;
