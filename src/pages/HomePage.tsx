import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box9, { BOX9_PROJECT_URL } from '../components/Box9';
import Logo3D from '../components/Logo3D';
import './HomePage.css';

interface TypedTextProps {
  text: string;
  charDelay?: number;
  startDelay?: number;
  pauseAfterIndex?: number;
  pauseDuration?: number;
  className?: string;
}

const TypedText: React.FC<TypedTextProps> = ({ text, charDelay = 40, startDelay = 0, pauseAfterIndex, pauseDuration = 0, className }) => (
  <span className={className}>
    {Array.from(text).map((char, i) => {
      const extra = pauseAfterIndex !== undefined && i > pauseAfterIndex ? pauseDuration : 0;
      return (
        <span
          key={i}
          className="typed-char"
          style={{ animationDelay: `${startDelay + i * charDelay + extra}ms` } as React.CSSProperties}
        >
          {char}
        </span>
      );
    })}
  </span>
);

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
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
    images: ['/img/Scarlet/Landing_1.jpg', '/img/Scarlet/Landing_2.mp4', '/img/Scarlet/Landing_3.jpg'],
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
  },
];

let hasAnimatedOnce = false;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(hasAnimatedOnce ? 4 : 0);
  const [hoveredBullet, setHoveredBullet] = useState<number | null>(null);

  useEffect(() => {
    if (hasAnimatedOnce) return;
    const t1 = setTimeout(() => { setStep(4); hasAnimatedOnce = true; }, 0);
    return () => { clearTimeout(t1); };
  }, []);

  const handleBulletClick = (path?: string, externalHref?: string) => {
    if (path) {
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
            {step >= 4 && <TypedText text="Soheum Hwang" charDelay={50} pauseAfterIndex={1} pauseDuration={1000} />}
          </span>
          {step >= 4 && (
            <span className="home-title__name--pronunciation home-title__pronunciation">
              <TypedText text="/so? hmmm.../" charDelay={35} pauseAfterIndex={3} pauseDuration={1000} />
            </span>
          )}
        </h1>

        <ul className={`home-bullets home-bullets--animated ${step >= 4 ? 'home-bullets--visible' : ''}`}>
          {BULLET_POINTS.map(({ index, text, path, externalHref, images }) => {
            const isLink = Boolean(path || externalHref);
            const hasHoverImages = SHOW_BULLET_HOVER_IMAGES && images.some(Boolean);
            return (
            <li
              key={index}
              className={`home-bullet${isLink ? ' home-bullet--link' : ''}`}
              onMouseEnter={hasHoverImages ? () => setHoveredBullet(index) : undefined}
              onMouseLeave={hasHoverImages ? () => setHoveredBullet(null) : undefined}
              onClick={isLink ? () => handleBulletClick(path, externalHref) : undefined}
              role={isLink ? 'link' : undefined}
              tabIndex={isLink ? 0 : undefined}
              onKeyDown={isLink ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBulletClick(path, externalHref);
                }
              } : undefined}
            >
              <span className="home-bullet__index">[{index}]</span><span>{text}</span>
            </li>
            );
          })}
        </ul>
      </div>

      {SHOW_BULLET_HOVER_IMAGES && hoveredBullet !== null && (() => {
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
