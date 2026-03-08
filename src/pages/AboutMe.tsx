import React from 'react';
import Box1 from '../components/Box1';
import './AboutMe.css';
const AboutMe: React.FC = () => (
  <main className="about-me">
    <div className="about-me__box1-frame">
      <Box1 progress={1} />
    </div>
  </main>
);

export default AboutMe;
