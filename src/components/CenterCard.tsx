import React from 'react';
import './CenterCard.css';

interface CenterCardProps {
  text: string;
  startReveal: boolean;
  typedSegment?: string;
  scrollHint?: string;
}

const CenterCard: React.FC<CenterCardProps> = ({ text, startReveal, typedSegment, scrollHint }) => {
  const fullName = "Soheum Hwang";

  const textLines = text.split('\n');

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
              {line}
            </span>
          );
        })}
      </p>
      <div className="center-card__footer">
        <p className="center-card__links">
          <a href="https://www.linkedin.com/in/so-heum-hwang/" className="center-card__link" target="_blank" rel="noopener noreferrer">LinkedIn</a> /{' '}
          {/* <a href="#" className="center-card__link">CV</a> /{' '} */}
          <a href="mailto:sohheum@gmail.com" className="center-card__link">Email</a>
        </p>
        {scrollHint ? (
          <p className="center-card__scroll-hint">{scrollHint}</p>
        ) : null}
      </div>
    </div>
  );
};

export default CenterCard;
