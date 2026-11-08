import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import TypewriterText from '../components/TypewriterText';
import {
  PROJECT_INDEX_HOLD_MS,
  PROJECT_INDEX_MOVE_MS,
  type ProjectIndexNavState,
} from '../utils/projectNavState';
import './ProjectDetails.css';

const LANDING_HEADLINE =
  'Transforming regulatory data collection at the Bank of England';

type LandingIntroPhase = 'index-hold' | 'index-move' | 'typing';

const BankOfEnglandProject: React.FC = () => {
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
  const [indexMoveTargetLeft, setIndexMoveTargetLeft] = useState<number | null>(null);
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
    setIndexMoveTargetLeft(null);
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

    const destRect = anchor.getBoundingClientRect();
    setIndexMoveTargetTop(destRect.top);
    setIndexMoveTargetLeft(destRect.left);

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
            left:
              introPhase === 'index-move' && indexMoveTargetLeft !== null
                ? indexMoveTargetLeft
                : floatingIndexLeft,
          }}
          onTransitionEnd={(event) => {
            if (
              (event.propertyName === 'top' || event.propertyName === 'left') &&
              introPhase === 'index-move'
            ) {
              finishIndexMove();
            }
          }}
          aria-hidden="true"
        >
          [3]
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
                    [3]
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
                  <p>
                   Part of the founding design team at the Bank
                  </p>
                  <p>
                    A joint transformation programme with the FCA
                    <br />
                    Redesigning how the Bank collects data from financial institutions
                    
                  </p>
                </div>
              </div>
              <div className="project-landing-footer-meta project-landing-reveal">
                <p>Jan 2024 - Feb 2025</p>
              </div>
            </div>
            <div className="project-landing-inner__external-link project-landing-reveal">
              <a
                href="https://www.bankofengland.co.uk/prudential-regulation/transforming-data-collection"
                className="project-landing-link-btn project-landing-link-btn--outline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bank of England Transforming Data Collection page"
              >
                <img
                  src="/img/ArrowUpRight.svg"
                  alt=""
                  className="project-landing-link-btn__icon"
                />
              </a>
            </div>
          </div>
          <div className="project-landing-media project-landing-reveal">
            {landingTypingComplete && (
              <div className="hero-image-grid hero-carousel">
                <img
                  src="/img/BoE/landing_1.webp"
                  alt="Residential mortgage business process map"
                  className="hero-carousel__video"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BankOfEnglandProject;
