import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box9, { BOX9_PROJECT_URL } from '../components/Box9';
import Logo3D from '../components/Logo3D';
import TypedText from '../components/TypedText';
import type { ProjectIndexNavState } from '../utils/projectNavState';
import './HomePage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

type BulletImage = string | 'box9' | 'logo3d';

const SHOW_BULLET_HOVER_IMAGES = true;

const BULLET_POINTS: {
  index: number;
  text: React.ReactNode;
  images: [BulletImage, BulletImage, BulletImage];
  path?: string;
  externalHref?: string;
}[] = [
  {
    index: 1,
    text: <>Senior product designer based in London, accelerating medical devices to market at <span style={{ color: '#ffffff', fontWeight: 400 }}>Scarlet</span></>,
    images: ['/img/Grid/Landing_scarlet_2.jpg', '/img/Grid/Landing_0.mp4', '/img/Grid/Landing_scarlet_1.jpg'],
    path: '/project',
  },
  {
    index: 2,
    text: <>Previously a digital product designer at <span style={{ color: '#ffffff', fontWeight: 400 }}>McKinsey & Company</span>, helping clients build digital businesses</>,
    images: ['/img/Grid/Box9_8.jpg', 'box9', '/img/Grid/Box9_10_1.jpg'],
    externalHref: BOX9_PROJECT_URL,
  },
  {
    index: 3,
    text: <>Previously a public sector product designer at the <span style={{ color: '#ffffff', fontWeight: 400 }}>Bank of England</span>, transforming regulatory data collection processes</>,
    images: ['/img/Grid/3_Landing_1.jpg', '/img/Grid/3_Landing_2.jpg', '/img/Grid/3_Landing_3.jpg'],
  },
  {
    index: 4,
    text: 'A strong believer that creativity thrives at the intersection of contrasting values',
    images: ['', '', ''],
  },
  {
    index: 5,
    text: 'A visual storyteller, curating thoughtfully designed spaces through photography and text',
    images: ['', '', ''],
    externalHref: 'https://www.instagram.com/iso_heum/',
  },
];

let hasAnimatedOnce = false;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(hasAnimatedOnce ? 4 : 0);
  const [isIntroComplete, setIsIntroComplete] = useState(hasAnimatedOnce);
  const [hoveredBullet, setHoveredBullet] = useState<number | null>(null);
  const scarletIndexRef = useRef<HTMLSpanElement>(null);
  const introLinesCompletedRef = useRef(0);

  const handleTypedLineComplete = useCallback(() => {
    introLinesCompletedRef.current += 1;
    if (introLinesCompletedRef.current >= 2) {
      setIsIntroComplete(true);
      hasAnimatedOnce = true;
    }
  }, []);

  useEffect(() => {
    if (!isIntroComplete) setHoveredBullet(null);
  }, [isIntroComplete]);

  useEffect(() => {
    if (hasAnimatedOnce) return;
    const t1 = setTimeout(() => { setStep(4); }, 0);
    return () => { clearTimeout(t1); };
  }, []);

  const handleBulletClick = (path?: string, externalHref?: string, index?: number) => {
    if (path) {
      if (path === '/project' && index === 1 && scarletIndexRef.current) {
        const rect = scarletIndexRef.current.getBoundingClientRect();
        const state: ProjectIndexNavState = {
          indexRect: { top: rect.top, left: rect.left },
        };
        navigate(path, { state });
        return;
      }
      navigate(path);
      return;
    }
    if (externalHref) {
      window.open(externalHref, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">
          <span
            className="home-title__name"
            style={{ opacity: step >= 4 ? 1 : 0 }}
          >
            {step >= 4 && <TypedText text="Soheum Hwang" charDelay={50} pauseAfterIndex={1} pauseDuration={1000} onComplete={handleTypedLineComplete} />}
          </span>
          {step >= 4 && (
            <span className="home-title__name--pronunciation home-title__pronunciation">
              <TypedText text="/so? hmmm.../" charDelay={35} pauseAfterIndex={3} pauseDuration={1000} onComplete={handleTypedLineComplete} />
            </span>
          )}
        </h1>

        <ul className={`home-bullets home-bullets--animated ${step >= 4 ? 'home-bullets--visible' : ''}${isIntroComplete ? ' home-bullets--interactive' : ''}`}>
          {BULLET_POINTS.map(({ index, text, path, externalHref, images }) => {
            const isLink = Boolean(path || externalHref);
            const hasHoverImages = SHOW_BULLET_HOVER_IMAGES && images.some(Boolean);
            const canInteract = isIntroComplete;
            return (
            <li
              key={index}
              className={`home-bullet${isLink ? ' home-bullet--link' : ''}`}
              onMouseEnter={canInteract && hasHoverImages ? () => setHoveredBullet(index) : undefined}
              onMouseLeave={canInteract && hasHoverImages ? () => setHoveredBullet(null) : undefined}
              onClick={canInteract && isLink ? () => handleBulletClick(path, externalHref, index) : undefined}
              role={canInteract && isLink ? 'link' : undefined}
              tabIndex={canInteract && isLink ? 0 : undefined}
              onKeyDown={canInteract && isLink ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBulletClick(path, externalHref, index);
                }
              } : undefined}
            >
              <span
                ref={index === 1 ? scarletIndexRef : undefined}
                className={`home-bullet__index${index === 1 && path ? ' home-bullet__index--link' : ''}`}
                onClick={
                  canInteract && index === 1 && path
                    ? (event) => {
                        event.stopPropagation();
                        handleBulletClick(path, externalHref, index);
                      }
                    : undefined
                }
              >
                [{index}]
              </span>
              <span>{text}</span>
            </li>
            );
          })}
        </ul>
      </div>

      {SHOW_BULLET_HOVER_IMAGES && isIntroComplete && hoveredBullet !== null && (() => {
        const bullet = BULLET_POINTS.find(b => b.index === hoveredBullet);
        return (
          <div className="bullet-image-stack">
            {bullet?.images.map((src, i) => (
              <div
                key={i}
                className="bullet-image-stack__item"
                style={{ zIndex: i + 1 }}
              >
                {src === 'box9' ? (
                  <div className="bullet-image-stack__box9">
                    <Box9 progress={1} preview />
                  </div>
                ) : src === 'logo3d' ? (
                  <Logo3D className="bullet-image-stack__logo3d" />
                ) : src && (src.endsWith('.mp4')
                  ? <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        );
      })()}

      <nav className={`home-nav home-nav--animated ${step >= 4 ? 'home-nav--visible' : ''}`}>
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

export default HomePage;
