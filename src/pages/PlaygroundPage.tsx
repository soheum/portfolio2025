import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box1 from '../components/Box1';
import Box2 from '../components/Box2';
import Box5 from '../components/Box5';
import GraphCard from '../components/GraphCard';
import TypewriterText from '../components/TypewriterText';
import './HomePage.css';
import './PlaygroundPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

const LANDING_TITLE = 'My sketchbook';
const REVEAL_PAUSE_MS = 500;
const TYPING_START_DELAY_MS = 200;
const TYPING_CHAR_DELAY_MS = Math.round(
  (700 - TYPING_START_DELAY_MS) / (LANDING_TITLE.length - 1),
);

const PlaygroundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typingComplete, setTypingComplete] = useState(false);
  const revealDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (revealDelayRef.current) clearTimeout(revealDelayRef.current);
  }, []);

  const handleTypingComplete = useCallback(() => {
    revealDelayRef.current = setTimeout(() => {
      setTypingComplete(true);
      revealDelayRef.current = null;
    }, REVEAL_PAUSE_MS);
  }, []);

  return (
    <div className={`home-page home-page--top-aligned playground-page${typingComplete ? ' home-page--revealed' : ''}`}>
      <div className="home-content playground-content">
        <h1 className="home-title">
          <span className="home-title__name playground-title">
            <span className="playground-title__sizer" aria-hidden="true">{LANDING_TITLE}</span>
            <TypewriterText
              className="playground-title__typewriter"
              text={LANDING_TITLE}
              charDelay={TYPING_CHAR_DELAY_MS}
              startDelay={TYPING_START_DELAY_MS}
              onComplete={handleTypingComplete}
            />
          </span>
        </h1>

        <main className="playground-stage playground-reveal" aria-label="Playground animation experiments">
        <section className="playground-card playground-card--box1" aria-label="Box1 click animation">
          <Box1 progress={1} />
        </section>

        <section className="playground-card playground-card--box2" aria-label="Box2 Scarlet file animation">
          <Box2 progress={1} disableNavigation />
        </section>

        <section className="playground-card playground-card--box5" aria-label="Box5 photo cloud animation">
          <Box5 progress={1} />
        </section>

        <section className="playground-card playground-card--graph" aria-label="GraphCard drag animation">
          <GraphCard />
        </section>

        <section className="playground-card playground-card--gif1" aria-label="Playing card flip animation">
          <img
            className="playground-card__media"
            src="/img/Grid/Landing_playground.gif"
            alt="Playing card flip animation"
          />
        </section>

        <section className="playground-card playground-card--gif2" aria-label="UI experiment animation">
          <img
            className="playground-card__media"
            src="/img/Grid/Landing_playground_2.gif"
            alt="UI experiment animation"
          />
        </section>
        </main>
      </div>

      <nav className="home-nav playground-reveal">
        {NAV_ITEMS.map(({ label, path }) => (
          <button
            key={path}
            className={`home-nav__item ${location.pathname === path ? 'home-nav__item--active' : ''}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PlaygroundPage;
