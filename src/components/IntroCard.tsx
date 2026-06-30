import React from 'react';
import './GridPage.css';

interface IntroCardProps {
  depth?: number;
}

const IntroCard: React.FC<IntroCardProps> = ({ depth = 0 }) => {
  return (
    <article 
      className="tile intro-card" 
      style={{ '--parallax-depth': depth } as React.CSSProperties}
    >
      <h1 className="intro-name">Soheum Hwang</h1>
      <p className="intro-bio">
        I'm a designer focused on creating meaningful experiences at the intersection 
        of technology and human needs. Currently designing experiences to accelerate 
        medical software devices to market at Scarlet. Previously, I worked on 
        redefining the future of data collection as the first design team at the Bank 
        of England, and enabled clients to develop digital businesses with expertise 
        in complex data systems at McKinsey & Company.
      </p>
    </article>
  );
};

export default IntroCard;
