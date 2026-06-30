import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import TypewriterText from '../components/TypewriterText';
import {
  PROJECT_INDEX_HOLD_MS,
  PROJECT_INDEX_MOVE_MS,
  type ProjectIndexNavState,
} from '../utils/projectNavState';
import './ProjectDetails.css';

const LANDING_HEADLINE =
  'Building digital sincerity: Collaboration with GREETINGS FOLKs';

const GF_IMAGES = [
  '/img/GF/GF_1.jpg',
  '/img/GF/GF_2.jpg',
  '/img/GF/GF_3.png',
  '/img/GF/GF_4.png',
] as const;

const GF_SLIDE_INTERVAL_MS = 1500;

type LandingIntroPhase = 'index-hold' | 'index-move' | 'typing';

const GreetingsImageSlideshow: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GF_IMAGES.length);
    }, GF_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="hero-image-grid hero-carousel greetings-image-slideshow"
      aria-label="GREETINGS FOLKs product imagery"
    >
      {GF_IMAGES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`hero-carousel__img greetings-image-slideshow__img${
            index === activeIndex ? ' hero-carousel__img--visible' : ''
          }`}
        />
      ))}
    </div>
  );
};

const GreetingsProject: React.FC = () => {
  const location = useLocation();
  const navState = location.state as ProjectIndexNavState | null;
  const hasIndexTransition = Boolean(navState?.indexRect);
  const indexAnchorRef = useRef<HTMLSpanElement>(null);
  const indexHoldTimerRef = useRef<number | null>(null);
  const indexMoveTimerRef = useRef<number | null>(null);
  const indexMoveFinishedRef = useRef(false);
  const [landingTypingComplete, setLandingTypingComplete] = useState(false);
  const [introPhase, setIntroPhase] = useState<LandingIntroPhase>(() =>
    hasIndexTransition ? 'index-hold' : 'typing'
  );
  const [floatingIndexTop, setFloatingIndexTop] = useState<number | null>(
    hasIndexTransition ? navState?.indexRect?.top ?? null : null
  );
  const [floatingIndexLeft, setFloatingIndexLeft] = useState<number | null>(
    hasIndexTransition ? navState?.indexRect?.left ?? null : null
  );
  const [indexMoveTargetTop, setIndexMoveTargetTop] = useState<number | null>(null);
  const [showAnchoredIndex, setShowAnchoredIndex] = useState(!hasIndexTransition);

  const handleLandingTypingComplete = useCallback(() => {
    setLandingTypingComplete(true);
  }, []);

  const clearIndexTimers = useCallback(() => {
    if (indexHoldTimerRef.current !== null) {
      window.clearTimeout(indexHoldTimerRef.current);
      indexHoldTimerRef.current = null;
    }
    if (indexMoveTimerRef.current !== null) {
      window.clearTimeout(indexMoveTimerRef.current);
      indexMoveTimerRef.current = null;
    }
  }, []);

  const finishIndexMove = useCallback(() => {
    if (indexMoveFinishedRef.current) return;
    indexMoveFinishedRef.current = true;
    clearIndexTimers();
    setFloatingIndexTop(null);
    setFloatingIndexLeft(null);
    setIndexMoveTargetTop(null);
    setShowAnchoredIndex(true);
    setIntroPhase('typing');
  }, [clearIndexTimers]);

  useLayoutEffect(() => {
    if (!hasIndexTransition) return;

    const anchor = indexAnchorRef.current;
    if (!anchor) {
      finishIndexMove();
      return;
    }

    const destTop = anchor.getBoundingClientRect().top;
    setIndexMoveTargetTop(destTop);

    indexHoldTimerRef.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setIntroPhase('index-move');
        indexMoveTimerRef.current = window.setTimeout(
          finishIndexMove,
          PROJECT_INDEX_MOVE_MS + 50
        );
      });
    }, PROJECT_INDEX_HOLD_MS);

    return clearIndexTimers;
  }, [hasIndexTransition, finishIndexMove, clearIndexTimers]);

  return (
    <div className="project-details-page">
      {floatingIndexTop !== null && floatingIndexLeft !== null && (
        <span
          className={`project-landing-index-float${introPhase === 'index-move' ? ' project-landing-index-float--moving' : ''}`}
          style={{
            top:
              introPhase === 'index-move' && indexMoveTargetTop !== null
                ? indexMoveTargetTop
                : floatingIndexTop,
            left: floatingIndexLeft,
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'top' && introPhase === 'index-move') {
              finishIndexMove();
            }
          }}
          aria-hidden="true"
        >
          [4]
        </span>
      )}
      <section
        className={`project-landing${landingTypingComplete ? ' project-landing--revealed' : ''}`}
        id="project-landing"
        aria-label="Project introduction"
      >
        <div className="project-landing-shell">
          <div className="project-landing-inner">
            <div className="project-landing-inner__main">
              <div className="project-landing-intro">
                <div className="project-landing-intro__head">
                  <span
                    ref={indexAnchorRef}
                    className={`project-landing-index${showAnchoredIndex ? '' : ' project-landing-index--hidden'}`}
                  >
                    [4]
                  </span>
                  <h1
                    className={`project-landing-headline${
                      introPhase !== 'typing' && !landingTypingComplete
                        ? ' project-landing-headline--reserve-space'
                        : ''
                    }`}
                  >
                    <span className="project-landing-headline__sizer" aria-hidden="true">
                      {LANDING_HEADLINE}
                    </span>
                    <TypewriterText
                      text={LANDING_HEADLINE}
                      charDelay={28}
                      startDelay={200}
                      active={introPhase === 'typing'}
                      onComplete={handleLandingTypingComplete}
                    />
                  </h1>
                </div>
                <div className="project-landing-col project-landing-col--body project-landing-reveal">
                  <p>(Coming soon)</p>
                  <p>
                    Moving beyond AI-generated interaction <br/> to a personal and meaningful digital experience
                  </p>
                  <p>
                    Collaboration with Korean stationery brand, GREETINGS FOLKs, <br />
                    launching the service from product strategy to implementation
                  </p>
                </div>
              </div>
              <div className="project-landing-footer-meta project-landing-reveal">
                <p>June 2025 – present</p>
                <p>with 1 Brand designer</p>
              </div>
            </div>
            {landingTypingComplete && (
              <div className="project-landing-inner__lock project-landing-reveal">
                <a
                  href="https://greetingsfolks.com/"
                  className="project-landing-link-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open GREETINGS FOLKs website"
                >
                  <img
                    src="/img/ArrowUpRight.svg"
                    alt=""
                    className="project-landing-link-btn__icon"
                  />
                </a>
              </div>
            )}
          </div>
          <div className="project-landing-media project-landing-reveal">
            {landingTypingComplete && <GreetingsImageSlideshow />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GreetingsProject;
